// ============================================================
// HireFlow — Phase 11.1 Flagship Tailor My Resume Workspace
// Route: /tools/tailor
// ============================================================

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Undo2,
  Redo2,
  Download,
  FileDown,
  FileText,
  ArrowLeft,
  Layers,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { PublicNavbar } from '@/components/common/PublicNavbar';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useTailorWorkspaceStore } from './store/useTailorWorkspaceStore';
import { TailorEntryView } from './components/TailorEntryView';
import { TailorStructureRail } from './components/TailorStructureRail';
import { TailorDocumentCanvas } from './components/TailorDocumentCanvas';
import { TailorIntelligencePanel } from './components/TailorIntelligencePanel';
import {
  exportTailoredDocx,
  exportTailoredMarkdown,
  exportTailoredPdf,
  triggerBlobDownload,
} from './export/tailorExportAdapter';

export function TailorWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ctxParam = searchParams.get('ctx');
  const draftParam = searchParams.get('draft');

  const {
    sessions,
    activeSessionId,
    hydrateFromLaunchContext,
    resumeDraft,
    closeActiveSession,
    undo,
    redo,
    runValidation,
    recordExportArtifact,
    runCanonicalReanalysis,
    persistSessionToCloud,
  } = useTailorWorkspaceStore();

  const authStatus = useAuthStore((s) => s.status);
  const authIsDemo = useAuthStore((s) => s.isDemo);
  const authMode: 'cloud' | 'demo' =
    authStatus === 'authenticated' && !authIsDemo ? 'cloud' : 'demo';
  const [exportBusy, setExportBusy] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    kind: 'ok' | 'err';
    message: string;
  } | null>(null);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (ctxParam) {
        setHydrating(true);
        const ok = await hydrateFromLaunchContext(ctxParam);
        if (!cancelled) {
          if (!ok) closeActiveSession();
          setHydrating(false);
        }
      } else if (draftParam) {
        const ok = resumeDraft(draftParam);
        if (!ok) {
          closeActiveSession();
          useTailorWorkspaceStore.setState({
            lastError: 'Requested tailoring draft was not found in this session.',
          });
        }
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [ctxParam, draftParam, hydrateFromLaunchContext, resumeDraft, closeActiveSession]);

  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  // Reset scroll cleanly below PublicNavbar synchronously before paint whenever entering or switching a workspace session
  useLayoutEffect(() => {
    if (activeSessionId && typeof window !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [activeSessionId]);

  // Warn before unloading tab when authenticated cloud draft has unsaved edits
  useEffect(() => {
    if (!activeSession || authMode !== 'cloud') return;
    const hasUnsavedCloudEdits =
      (activeSession.syncRevision ?? 1) > (activeSession.lastSavedRevision ?? 0);
    if (!hasUnsavedCloudEdits) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [activeSession, authMode]);

  async function handleSaveCloudDraft() {
    if (!activeSession) return;
    setSavingDraft(true);
    const saved = await persistSessionToCloud(activeSession.sessionId);
    setSavingDraft(false);
    if (saved) {
      setStatusBanner({ kind: 'ok', message: 'Tailoring draft saved to cloud repository.' });
    } else if (authMode === 'cloud') {
      setStatusBanner({
        kind: 'err',
        message:
          useTailorWorkspaceStore.getState().sessions[activeSession.sessionId]?.cloudSyncError ||
          'Cloud save failed — draft remains in session memory until saved.',
      });
    }
  }

  async function handleExport(format: 'pdf' | 'docx' | 'md') {
    if (!activeSession) return;
    const report = runValidation();
    if (report && (!report.factualPassed || !report.documentPassed)) {
      setStatusBanner({
        kind: 'err',
        message:
          report.blockingIssues[0]?.message ||
          'Export blocked by Validation Gate: resolve unverified claims or document issues first.',
      });
      return;
    }

    setExportBusy(true);
    setStatusBanner(null);
    try {
      const meta = {
        sourceAuditId: activeSession.reanalysisAuditId ?? activeSession.sourceAuditId,
        sourceVersionId: activeSession.committedVersionId ?? activeSession.parentVersionId,
        label: activeSession.jdTitle || activeSession.targetRole || 'Tailored',
      };
      if (format === 'pdf') {
        const out = await exportTailoredPdf(activeSession.document, meta);
        recordExportArtifact(out.artifact);
        triggerBlobDownload(out.blob, out.artifact.fileName);
        setStatusBanner({
          kind: 'ok',
          message: `Exported ${out.artifact.fileName} (${Math.max(1, Math.round(out.artifact.byteSize / 1024))} KB)`,
        });
      } else if (format === 'docx') {
        const out = await exportTailoredDocx(activeSession.document, meta);
        recordExportArtifact(out.artifact);
        triggerBlobDownload(out.blob, out.artifact.fileName);
        setStatusBanner({
          kind: 'ok',
          message: `Exported ${out.artifact.fileName} (${Math.max(1, Math.round(out.artifact.byteSize / 1024))} KB)`,
        });
      } else {
        const out = exportTailoredMarkdown(activeSession.document, meta);
        recordExportArtifact(out.artifact);
        triggerBlobDownload(out.blob, out.artifact.fileName);
        setStatusBanner({ kind: 'ok', message: `Exported ${out.artifact.fileName}` });
      }
    } catch (err) {
      setStatusBanner({
        kind: 'err',
        message: err instanceof Error ? err.message : 'Export failed.',
      });
    } finally {
      setExportBusy(false);
    }
  }

  async function handleTopRescore() {
    setExportBusy(true);
    setStatusBanner(null);
    try {
      const ref = await runCanonicalReanalysis();
      setStatusBanner({
        kind: 'ok',
        message: `Canonical ${ref.engineVersion} ATS score updated: ${ref.overallScore}/100.`,
      });
    } catch (err) {
      setStatusBanner({
        kind: 'err',
        message: err instanceof Error ? err.message : 'Unable to run ATS re-analysis.',
      });
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a08] text-[#f1f1e8] flex flex-col">
      <PublicNavbar />

      {hydrating ? (
        <main
          id="main-content"
          className="flex-1 max-w-6xl mx-auto w-full px-6 pt-28 pb-12 space-y-3"
        >
          <h1 className="text-2xl font-bold text-[#f1f1e8]">Loading Tailoring Context...</h1>
          <p className="text-sm text-[#9b9b8c]">
            Resolving authoritative resume snapshot and target context cleanly.
          </p>
        </main>
      ) : !activeSession ? (
        <main id="main-content" className="flex-1 pt-24 sm:pt-28">
          <TailorEntryView />
        </main>
      ) : (
        <main
          id="main-content"
          className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8 space-y-4"
        >
          {/* Top Unified Workspace Action Bar */}
          <header className="p-3.5 rounded-2xl border border-[#24241c] bg-[#10100d] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => {
                  closeActiveSession();
                  if (ctxParam || draftParam) setSearchParams({});
                }}
                aria-label="Switch resume or return to workspace entry"
                className="p-2 rounded-full border border-[#24241c] text-[#9b9b8c] hover:text-[#f1f1e8]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#f1f1e8] truncate">
                    {activeSession.title}
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b1b15] border border-[#2d2d22] text-[#faff69] uppercase font-semibold">
                    {activeSession.draftStatus.replace(/_/g, ' ')}
                  </span>
                  {authMode === 'cloud' ? (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-semibold ${
                        activeSession.cloudSyncStatus === 'saved'
                          ? 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300'
                          : activeSession.cloudSyncStatus === 'error'
                          ? 'border-rose-700/50 bg-rose-950/40 text-rose-300'
                          : 'border-[#2d2d22] bg-[#1b1b15] text-[#9b9b8c]'
                      }`}
                    >
                      {activeSession.cloudSyncStatus === 'saved'
                        ? 'Cloud Saved'
                        : activeSession.cloudSyncStatus === 'saving'
                        ? 'Saving...'
                        : activeSession.cloudSyncStatus === 'error'
                        ? 'Cloud Save Error'
                        : 'Unsaved Cloud Changes'}
                    </span>
                  ) : (
                    <span
                      title="Demo / Guest drafts exist in session memory only and do not survive a full browser reload."
                      className="text-[10px] px-2 py-0.5 rounded-full border border-amber-700/40 bg-amber-950/30 text-amber-200 uppercase font-semibold"
                    >
                      Demo RAM Draft (No Reload Persistence)
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#6d6d61] flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Mode: <strong className="text-[#9b9b8c]">{activeSession.mode}</strong>
                  </span>
                  {activeSession.committedVersionId && (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Version Committed
                    </span>
                  )}
                  {activeSession.reanalysisScore != null && (
                    <span className="inline-flex items-center gap-1 text-[#faff69]">
                      <TrendingUp className="w-3 h-3" />
                      ATS {activeSession.reanalysisScore}/100
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={activeSession.undoStack.length === 0}
                onClick={() => undo()}
                aria-label="Undo last edit"
                className="p-2 rounded-full border border-[#24241c] text-[#f1f1e8] disabled:opacity-30"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={activeSession.redoStack.length === 0}
                onClick={() => redo()}
                aria-label="Redo edit"
                className="p-2 rounded-full border border-[#24241c] text-[#f1f1e8] disabled:opacity-30"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              {authMode === 'cloud' && (
                <button
                  type="button"
                  disabled={savingDraft || exportBusy}
                  onClick={() => void handleSaveCloudDraft()}
                  className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/60 disabled:opacity-40"
                >
                  {savingDraft
                    ? 'Saving...'
                    : activeSession.cloudSyncStatus === 'error'
                    ? 'Retry Save'
                    : 'Save Draft'}
                </button>
              )}

              {activeSession.jdText.trim() && (
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={() => void handleTopRescore()}
                  className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/60 disabled:opacity-40"
                >
                  Re-Score ATS
                </button>
              )}

              <button
                type="button"
                disabled={exportBusy}
                onClick={() => void handleExport('pdf')}
                className="px-3.5 py-1.5 rounded-full bg-[#faff69] text-[#0a0a08] text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export PDF
              </button>
              <button
                type="button"
                disabled={exportBusy}
                onClick={() => void handleExport('docx')}
                className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                DOCX
              </button>
              <button
                type="button"
                disabled={exportBusy}
                onClick={() => void handleExport('md')}
                className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <FileText className="w-3.5 h-3.5" />
                MD
              </button>

              <Link
                to="/my-space/resumes"
                className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#9b9b8c] hover:text-[#f1f1e8]"
              >
                My Space
              </Link>
            </div>
          </header>

          {statusBanner && (
            <div
              role={statusBanner.kind === 'err' ? 'alert' : 'status'}
              className={`px-4 py-2.5 rounded-xl border text-xs ${
                statusBanner.kind === 'err'
                  ? 'border-[#ff6b4a]/40 bg-[#2a120d] text-[#ffb4a2]'
                  : 'border-[#24241c] bg-[#141410] text-[#faff69]'
              }`}
            >
              {statusBanner.message}
            </div>
          )}

          {/* 3-Zone Engineering Workspace Grid (keyed by sessionId to isolate local UI drafts) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-3">
              <TailorStructureRail key={activeSession.sessionId} session={activeSession} />
            </div>
            <div className="lg:col-span-5">
              <TailorDocumentCanvas key={activeSession.sessionId} session={activeSession} />
            </div>
            <div className="lg:col-span-4">
              <TailorIntelligencePanel key={activeSession.sessionId} session={activeSession} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
