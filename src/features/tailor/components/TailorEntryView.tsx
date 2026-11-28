// ============================================================
// HireFlow — Phase 11.1 Tailor Entry Experience
// Genuine source selection: Resume Matrix, File Upload, Paste,
// or Resume Saved Draft. Never fakes user identity or auto-loads presets.
// ============================================================

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  ClipboardPaste,
  Layers,
  Clock,
  Trash2,
  ArrowRight,
  AlertCircle,
  Briefcase,
  Target,
  Sparkles,
} from 'lucide-react';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { extractFromFile } from '@/lib/ats/fileExtractor';
import { useTailorWorkspaceStore } from '../store/useTailorWorkspaceStore';
import type { TailorMode } from '../model/tailorWorkspaceTypes';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const MODE_CARDS: Array<{
  id: TailorMode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'improve',
    title: 'Improve Existing Resume',
    subtitle: 'No JD needed — sharpen clarity, chronology, weak openers, and prompt for real metrics.',
    icon: Sparkles,
  },
  {
    id: 'role',
    title: 'Adapt to Role / Industry',
    subtitle: 'Calibrate positioning, section priority, and transferable evidence for a target direction.',
    icon: Target,
  },
  {
    id: 'jd',
    title: 'Tailor to Job Description',
    subtitle: 'Map logical AND/OR requirements against your verified proof ledger and close genuine gaps.',
    icon: Briefcase,
  },
];

export function TailorEntryView() {
  const workspacesMap = useResumeStore((s) => s.workspaces);
  const versionsMap = useResumeStore((s) => s.versions);
  const savedJds = useSavedJdStore((s) => s.jds);
  const authStatus = useAuthStore((s) => s.status);
  const authIsDemo = useAuthStore((s) => s.isDemo);
  const authMode: 'cloud' | 'demo' =
    authStatus === 'authenticated' && !authIsDemo ? 'cloud' : 'demo';

  const {
    sessions,
    lastError,
    clearError,
    createSessionFromMatrix,
    createSessionFromText,
    resumeDraft,
    deleteDraft,
  } = useTailorWorkspaceStore();

  const workspaces = useMemo(
    () =>
      Object.values(workspacesMap)
        .filter((w) => !w.archivedAt)
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || b.updatedAt.localeCompare(a.updatedAt)),
    [workspacesMap]
  );

  const savedDrafts = useMemo(
    () =>
      Object.values(sessions).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [sessions]
  );

  const [selectedMode, setSelectedMode] = useState<TailorMode>('improve');
  const [targetRole, setTargetRole] = useState('');
  const [selectedJdId, setSelectedJdId] = useState('');
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [jdCompany, setJdCompany] = useState('');

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    workspaces[0]?.id ?? ''
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  const [pasteLabel, setPasteLabel] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeWs =
    workspaces.find((w) => w.id === selectedWorkspaceId) ?? workspaces[0];
  const wsVersions = useMemo(() => {
    if (!activeWs) return [];
    return Object.values(versionsMap)
      .filter((v) => v.workspaceId === activeWs.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [activeWs, versionsMap]);

  const resolvedJd = savedJds.find((j) => j.id === selectedJdId);
  const effectiveJdText = resolvedJd ? resolvedJd.text : jdText;
  const effectiveJdTitle = resolvedJd ? resolvedJd.title : jdTitle;
  const effectiveJdCompany = resolvedJd ? resolvedJd.company || '' : jdCompany;

  async function handleStartFromMatrix() {
    if (!activeWs) return;
    setIsBusy(true);
    setLocalError(null);
    clearError();
    try {
      await createSessionFromMatrix({
        workspaceId: activeWs.id,
        versionId: selectedVersionId || activeWs.headVersionId,
        mode: selectedMode,
        targetRole: targetRole.trim() || activeWs.roleTrack,
        jdId: resolvedJd?.id ?? null,
        jdTitle: effectiveJdTitle,
        jdCompany: effectiveJdCompany,
        jdText: selectedMode === 'jd' ? effectiveJdText : '',
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to open selected resume.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalError(null);
    clearError();

    if (file.size === 0) {
      setLocalError(`"${file.name}" is empty (0 bytes). Choose a non-empty PDF, DOCX, TXT, or MD file.`);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setLocalError(`"${file.name}" exceeds the 5 MB limit. Upload a smaller resume file.`);
      e.target.value = '';
      return;
    }
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) {
      setLocalError(`Unsupported format for "${file.name}". Allowed formats: PDF, DOCX, TXT, or Markdown.`);
      e.target.value = '';
      return;
    }

    setIsBusy(true);
    setUploadStatus(`Extracting and validating "${file.name}"...`);
    try {
      const outcome = await extractFromFile(file);
      if (!outcome.ok) {
        setLocalError(
          outcome.message ||
            `Could not extract readable text from "${file.name}". Verify the file is not corrupted or password-locked and try again.`
        );
        return;
      }
      const extractedText = (outcome.data.text || '').trim();
      if (extractedText.length < 40) {
        setLocalError(
          `"${file.name}" yielded insufficient readable resume text (${extractedText.length} chars). Ensure the PDF/DOCX contains selectable text rather than scanned images.`
        );
        return;
      }
      const buffer = await file.arrayBuffer();
      const baseName = file.name.replace(/\.[^.]+$/, '');
      await createSessionFromText({
        text: extractedText,
        label: baseName || 'Uploaded Resume',
        entrySource: 'upload',
        fileAttachment: {
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          buffer,
        },
        mode: selectedMode,
        targetRole: targetRole.trim(),
        jdId: resolvedJd?.id ?? null,
        jdTitle: effectiveJdTitle,
        jdCompany: effectiveJdCompany,
        jdText: selectedMode === 'jd' ? effectiveJdText : '',
        createMatrixWorkspace: true,
      });
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? `File upload failed: ${err.message}`
          : 'File upload failed due to unreadable content.'
      );
    } finally {
      setIsBusy(false);
      setUploadStatus(null);
      e.target.value = '';
    }
  }

  async function handlePasteStart(e: React.FormEvent) {
    e.preventDefault();
    if (pasteText.trim().length < 40) {
      setLocalError('Paste at least 40 characters of your resume to parse sections and claims.');
      return;
    }
    setIsBusy(true);
    setLocalError(null);
    clearError();
    try {
      await createSessionFromText({
        text: pasteText.trim(),
        label: pasteLabel.trim() || 'Pasted Resume',
        entrySource: 'paste',
        mode: selectedMode,
        targetRole: targetRole.trim(),
        jdId: resolvedJd?.id ?? null,
        jdTitle: effectiveJdTitle,
        jdCompany: effectiveJdCompany,
        jdText: selectedMode === 'jd' ? effectiveJdText : '',
        createMatrixWorkspace: true,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to initialize session.');
    } finally {
      setIsBusy(false);
    }
  }

  const errorBanner = localError || lastError;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#24241c] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191913] border border-[#2d2d22] text-[11px] font-semibold uppercase tracking-wider text-[#faff69]">
            <Layers className="w-3.5 h-3.5" />
            HireFlow Resume Engineering
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f1f1e8]">
            Tailor My Resume
          </h1>
          <p className="text-sm text-[#9b9b8c] max-w-2xl">
            Bring an existing resume from Resume Matrix, upload PDF/DOCX/TXT/MD, or paste your
            current draft. Every edit preserves provenance and passes factual truth checks before
            creating a new immutable Resume Version.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/my-space"
            className="px-4 py-2 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40"
          >
            Back to My Space
          </Link>
          <Link
            to="/tools/resume-checker"
            className="px-4 py-2 rounded-full border border-[#24241c] text-xs font-semibold text-[#9b9b8c] hover:text-[#f1f1e8]"
          >
            Open ATS Roaster
          </Link>
        </div>
      </div>

      {errorBanner && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-[#ff6b4a]/40 bg-[#2a120d] text-sm text-[#ffb4a2] flex items-center gap-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#ff6b4a]" />
          <span>{errorBanner}</span>
        </div>
      )}

      {uploadStatus && (
        <div
          role="status"
          className="p-3 rounded-xl border border-[#2d2d22] bg-[#141410] text-xs text-[#faff69]"
        >
          {uploadStatus}
        </div>
      )}

      {/* Step 1: Select Engineering Mode & Target Context */}
      <section className="space-y-3" aria-label="Tailoring Mode Selection">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#6d6d61]">
          1. Select Engineering Mode (Optional to Adjust Later Inside Workspace)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MODE_CARDS.map((card) => {
            const Icon = card.icon;
            const active = selectedMode === card.id;
            return (
              <button
                key={card.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedMode(card.id)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  active
                    ? 'border-[#faff69] bg-[#181910]'
                    : 'border-[#24241c] bg-[#10100d] hover:border-[#3b3b2d]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-semibold ${
                      active ? 'text-[#faff69]' : 'text-[#f1f1e8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {card.title}
                  </span>
                  {active && (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#faff69] text-[#0a0a08]">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9b9b8c] leading-relaxed">{card.subtitle}</p>
              </button>
            );
          })}
        </div>

        {(selectedMode === 'role' || selectedMode === 'jd') && (
          <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="tailor-target-role" className="block text-xs font-medium text-[#9b9b8c]">
                Target Role Title {selectedMode === 'role' ? '(Required for Role Mode)' : '(Optional)'}
              </label>
              <input
                id="tailor-target-role"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Backend Software Engineer, Security Analyst, Data Scientist"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8] focus:outline-none focus:border-[#faff69]"
              />
            </div>

            {selectedMode === 'jd' && (
              <div className="space-y-2">
                <label htmlFor="tailor-saved-jd" className="block text-xs font-medium text-[#9b9b8c]">
                  Use Saved Job Description (Optional)
                </label>
                <select
                  id="tailor-saved-jd"
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8] focus:outline-none focus:border-[#faff69]"
                >
                  <option value="">Paste a custom JD below...</option>
                  {savedJds.map((jd) => (
                    <option key={jd.id} value={jd.id}>
                      {jd.title} {jd.company ? `(${jd.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedMode === 'jd' && !selectedJdId && (
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  aria-label="JD Job Title"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  placeholder="JD Job Title (e.g., Senior Platform Engineer)"
                  className="px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8]"
                />
                <input
                  type="text"
                  aria-label="Company Name"
                  value={jdCompany}
                  onChange={(e) => setJdCompany(e.target.value)}
                  placeholder="Company Name (e.g., Stripe)"
                  className="px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8]"
                />
                <textarea
                  aria-label="Target Job Description text"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={4}
                  placeholder="Paste full Job Description requirements here..."
                  className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8] focus:outline-none focus:border-[#faff69]"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Step 2: Saved Drafts (if any) */}
      {savedDrafts.length > 0 && (
        <section className="space-y-3" aria-label="Saved Tailoring Drafts">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#6d6d61] flex items-center justify-between gap-2">
            <span>Continue Active Tailoring Drafts ({savedDrafts.length})</span>
            <span className="text-[10px] font-normal normal-case text-[#9b9b8c]">
              {authMode === 'cloud'
                ? 'Synced via cloud repository'
                : 'Demo session memory only — unsaved drafts reset on browser reload'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedDrafts.map((draft) => (
              <div
                key={draft.sessionId}
                className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#f1f1e8] truncate">{draft.title}</div>
                  <div className="text-xs text-[#6d6d61] flex items-center gap-2 mt-1">
                    <span className="uppercase text-[#faff69] font-semibold">{draft.mode}</span>
                    <span>&middot;</span>
                    <span>{draft.draftStatus.replace(/_/g, ' ')}</span>
                    {draft.reanalysisScore != null && (
                      <>
                        <span>&middot;</span>
                        <span>ATS {draft.reanalysisScore}/100</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => resumeDraft(draft.sessionId)}
                    className="px-3.5 py-1.5 rounded-full bg-[#faff69] text-[#0a0a08] text-xs font-bold hover:opacity-90"
                  >
                    Resume Draft
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      confirmDeleteId === draft.sessionId
                        ? (deleteDraft(draft.sessionId), setConfirmDeleteId(null))
                        : setConfirmDeleteId(draft.sessionId)
                    }
                    aria-label={
                      confirmDeleteId === draft.sessionId
                        ? `Confirm delete draft ${draft.title}`
                        : `Delete draft ${draft.title}`
                    }
                    className={`p-1.5 rounded-full ${
                      confirmDeleteId === draft.sessionId
                        ? 'text-[#ff6b4a] font-bold'
                        : 'text-[#6d6d61] hover:text-[#ff8a70]'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {confirmDeleteId === draft.sessionId && (
                  <div role="status" className="text-[11px] text-[#ffb4a2] ml-2">
                    Click trash again to confirm delete
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 3: Three Source Entry Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Resume Source Options">
        {/* Card A: Resume Matrix */}
        <div className="p-5 rounded-2xl border border-[#24241c] bg-[#10100d] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f1f1e8]">
              <FileText className="w-4 h-4 text-[#faff69]" />
              Choose from Resume Matrix
            </div>
            {workspaces.length === 0 ? (
              <p className="text-xs text-[#9b9b8c] leading-relaxed">
                No saved resumes are in your Resume Matrix for this session yet. Upload a file or
                paste text on the right to start—HireFlow will save v1 automatically.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="tailor-matrix-ws" className="block text-xs text-[#9b9b8c] mb-1">
                    Resume Workspace
                  </label>
                  <select
                    id="tailor-matrix-ws"
                    value={activeWs?.id ?? ''}
                    onChange={(e) => {
                      setSelectedWorkspaceId(e.target.value);
                      setSelectedVersionId('');
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8]"
                  >
                    {workspaces.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.roleTrack}) {w.isPrimary ? '• Primary' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {wsVersions.length > 0 && (
                  <div>
                    <label htmlFor="tailor-matrix-ver" className="block text-xs text-[#9b9b8c] mb-1">
                      Source Version
                    </label>
                    <select
                      id="tailor-matrix-ver"
                      value={selectedVersionId || activeWs?.headVersionId || ''}
                      onChange={(e) => setSelectedVersionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-sm text-[#f1f1e8]"
                    >
                      {wsVersions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} ({v.source})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={isBusy || workspaces.length === 0}
            onClick={handleStartFromMatrix}
            className="w-full py-2.5 px-4 rounded-full bg-[#faff69] text-[#0a0a08] text-xs font-bold disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            Open Selected Resume
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card B: Upload Resume File */}
        <div className="p-5 rounded-2xl border border-[#24241c] bg-[#10100d] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f1f1e8]">
              <Upload className="w-4 h-4 text-[#faff69]" />
              Upload Resume File
            </div>
            <p className="text-xs text-[#9b9b8c] leading-relaxed">
              Extracts text securely from PDF, DOCX, TXT, or Markdown and preserves your original file
              as immutable v1 in Resume Matrix.
            </p>
            <label className="block border border-dashed border-[#3b3b2d] hover:border-[#faff69]/60 focus-within:ring-2 focus-within:ring-[#faff69] rounded-xl p-6 text-center cursor-pointer bg-[#0a0a08] transition-colors">
              <Upload className="w-6 h-6 mx-auto mb-2 text-[#faff69]" />
              <span className="block text-xs font-semibold text-[#f1f1e8]">
                Click to select PDF, DOCX, TXT, or MD
              </span>
              <span className="block text-[11px] text-[#6d6d61] mt-1">Max 5 MB &middot; Hardened client parser</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                disabled={isBusy}
                onChange={handleFileUpload}
                className="sr-only"
                aria-label="Upload resume file"
              />
            </label>
          </div>
          <div className="text-[11px] text-[#6d6d61]">
            Zero unverified facts or template defaults are ever injected during extraction.
          </div>
        </div>

        {/* Card C: Paste Resume Text */}
        <form
          onSubmit={handlePasteStart}
          className="p-5 rounded-2xl border border-[#24241c] bg-[#10100d] flex flex-col justify-between space-y-3"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#f1f1e8]">
              <ClipboardPaste className="w-4 h-4 text-[#faff69]" />
              Paste Resume Text
            </div>
            <input
              type="text"
              aria-label="Resume Label"
              value={pasteLabel}
              onChange={(e) => setPasteLabel(e.target.value)}
              placeholder="Resume Label (e.g., Backend Engineer Master CV)"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              placeholder="Paste your complete resume content here..."
              aria-label="Paste resume text"
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8] focus:outline-none focus:border-[#faff69]"
            />
          </div>
          <button
            type="submit"
            disabled={isBusy || pasteText.trim().length < 40}
            className="w-full py-2.5 px-4 rounded-full border border-[#faff69]/60 text-[#faff69] hover:bg-[#faff69] hover:text-[#0a0a08] text-xs font-bold disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-2"
          >
            Initialize Workspace from Paste
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>
    </div>
  );
}
