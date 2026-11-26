import React, { useState, useEffect } from 'react';
import { useResumeStore } from './useResumeStore';
import { ResumeLineage } from './ResumeLineage';
import type { ResumeWorkspace, ResumeVersion, TextSnapshot } from '@/domain/types';
import { diffWords, type DiffOp } from '@/lib/text/diff';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { Plus, GitFork, Star, Archive, Edit3, X } from 'lucide-react';
import { MAX_WORKSPACES, GUEST_MAX_WORKSPACES } from '@/domain/limits';
import { useAuthStore } from '@/features/auth/useAuthStore';

export const ResumeMatrixPage: React.FC = () => {
  const {
    workspaces,
    versions,
    activeWorkspaceId,
    setActive,
    createWorkspace,
    addVersion,
    forkWorkspace,
    setHead,
    setPrimary,
    renameWorkspace,
    archiveWorkspace,
  } = useResumeStore();

  const authStatus = useAuthStore((s) => s.status);
  const isGuest = authStatus !== 'authenticated';
  const workspaceLimit = isGuest ? GUEST_MAX_WORKSPACES : MAX_WORKSPACES;

  const activeWorkspaces = Object.values(workspaces).filter((w) => !w.archivedAt);
  const [selectedWsId, setSelectedWsId] = useState<string | null>(activeWorkspaceId || activeWorkspaces[0]?.id || null);

  const [modalMode, setModalMode] = useState<'create' | 'branch' | 'rename' | 'view_text' | 'compare' | null>(null);
  const [modalText, setModalText] = useState('');
  const [modalName, setModalName] = useState('');
  const [modalRoleTrack, setModalRoleTrack] = useState('');
  const [modalVersionLabel, setModalVersionLabel] = useState('');
  const [targetBranchVersion, setTargetBranchVersion] = useState<ResumeVersion | null>(null);
  const [compareDiff, setCompareDiff] = useState<DiffOp[] | null>(null);
  const [compareLabels, setCompareLabels] = useState<{ v1: string; v2: string } | null>(null);
  const [viewingSnapshot, setViewingSnapshot] = useState<TextSnapshot | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedWsId && activeWorkspaces.length > 0) {
      setSelectedWsId(activeWorkspaces[0]?.id || null);
    }
  }, [activeWorkspaces, selectedWsId]);

  const currentWorkspace = selectedWsId ? workspaces[selectedWsId] : null;
  const currentVersions = currentWorkspace
    ? Object.values(versions).filter((v) => v.workspaceId === currentWorkspace.id)
    : [];

  const handleOpenCreate = () => {
    if (activeWorkspaces.length >= workspaceLimit) {
      setErrorMsg(`Workspace limit reached (${workspaceLimit} max). ${isGuest ? 'Sign in to create up to 8 workspaces.' : ''}`);
      return;
    }
    setErrorMsg(null);
    setModalName('');
    setModalRoleTrack('');
    setModalText('');
    setModalMode('create');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { workspace } = await createWorkspace({
        name: modalName,
        roleTrack: modalRoleTrack,
        text: modalText,
        source: 'paste',
      });
      setSelectedWsId(workspace.id);
      setActive(workspace.id);
      setModalMode(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create workspace');
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !targetBranchVersion) return;
    try {
      await addVersion({
        workspaceId: currentWorkspace.id,
        text: modalText,
        label: modalVersionLabel || `Branch from ${targetBranchVersion.label}`,
        source: 'branch',
        parentVersionId: targetBranchVersion.id,
      });
      setModalMode(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to branch version');
    }
  };

  const handleCompare = async (v1: ResumeVersion, v2: ResumeVersion) => {
    const userId = useAuthStore.getState().userId;
    const s1 = await cloudRepository.fetchSnapshot(v1.snapshotHash, userId);
    const s2 = await cloudRepository.fetchSnapshot(v2.snapshotHash, userId);
    if (s1 && s2) {
      const diff = diffWords(s1.text, s2.text);
      setCompareDiff(diff);
      setCompareLabels({ v1: v1.label, v2: v2.label });
      setModalMode('compare');
    }
  };

  const handleViewText = async (v: ResumeVersion) => {
    const snap = await cloudRepository.fetchSnapshot(v.snapshotHash, useAuthStore.getState().userId);
    if (snap) {
      setViewingSnapshot(snap);
      setModalMode('view_text');
    }
  };

  return (
    <div className="min-h-screen bg-[#090907] text-neutral-200">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="inline-block px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#181814] text-[#faff69] border border-[#faff69]/20 rounded mb-2">
              Resume Matrix
            </div>
            <h1 className="text-xl font-mono font-semibold text-neutral-100">
              Role-Tailored Resumes & Version Tree
            </h1>
            <p className="text-xs text-neutral-400">
              Manage specialized resumes for different role tracks with snapshot-locked version branching.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors focus:ring-2 focus:ring-[#faff69]"
          >
            <Plus className="w-3.5 h-3.5" /> New Workspace
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded bg-red-950/40 border border-red-900/50 text-xs font-mono text-red-300 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Rail: Workspaces list */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 uppercase tracking-wider mb-2">
              <span>Workspaces ({activeWorkspaces.length}/{workspaceLimit})</span>
            </div>

            {activeWorkspaces.length === 0 ? (
              <div className="p-6 rounded bg-[#10100d] border border-neutral-800 text-center font-mono text-xs text-neutral-500">
                No active workspaces. Click "New Workspace" to create your first resume track.
              </div>
            ) : (
              activeWorkspaces.map((ws) => {
                const isSelected = ws.id === selectedWsId;
                const headVer = ws.headVersionId ? versions[ws.headVersionId] : null;
                const vCount = Object.values(versions).filter((v) => v.workspaceId === ws.id).length;

                return (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setSelectedWsId(ws.id);
                      setActive(ws.id);
                    }}
                    className={`p-4 rounded border transition-colors cursor-pointer text-xs font-mono ${
                      isSelected
                        ? 'bg-[#141410] border-[#faff69]'
                        : 'bg-[#10100d] border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-neutral-100 text-sm">{ws.name}</span>
                      {ws.isPrimary && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#faff69]">
                          <Star className="w-3 h-3 fill-current" /> Primary
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-400 mb-2">
                      Track: <span className="text-neutral-200">{ws.roleTrack || 'General'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-neutral-800/80">
                      <span>Head: {headVer?.label || 'None'}</span>
                      <span>{vCount} version{vCount === 1 ? '' : 's'}</span>
                    </div>

                    {/* Actions on active card */}
                    {isSelected && (
                      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-neutral-800/80 text-[10px]">
                        {!ws.isPrimary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimary(ws.id);
                            }}
                            className="text-neutral-400 hover:text-[#faff69]"
                          >
                            Set primary
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            forkWorkspace({
                              fromWorkspaceId: ws.id,
                              name: `${ws.name} (Fork)`,
                              roleTrack: ws.roleTrack,
                            });
                          }}
                          className="text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-0.5"
                        >
                          <GitFork className="w-3 h-3" /> Fork
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveWorkspace(ws.id);
                          }}
                          className="text-neutral-400 hover:text-red-400 ml-auto inline-flex items-center gap-0.5"
                        >
                          <Archive className="w-3 h-3" /> Archive
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Main Area: Lineage */}
          <div className="lg:col-span-8 bg-[#10100d] border border-neutral-800 rounded p-6">
            {currentWorkspace ? (
              <ResumeLineage
                workspaceId={currentWorkspace.id}
                versions={currentVersions}
                headVersionId={currentWorkspace.headVersionId}
                onSetHead={(vId) => setHead(currentWorkspace.id, vId)}
                onSelectVersion={handleViewText}
                onBranch={(v) => {
                  setTargetBranchVersion(v);
                  setModalVersionLabel(`Branch from ${v.label}`);
                  void cloudRepository
                    .fetchSnapshot(v.snapshotHash, useAuthStore.getState().userId)
                    .then((snap) => {
                      setModalText(snap?.text || '');
                      setModalMode('branch');
                    });
                }}
                onCompare={handleCompare}
              />
            ) : (
              <div className="text-center py-16 text-neutral-500 font-mono text-xs">
                Select a workspace on the left to inspect its version tree.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-lg w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg text-xs font-mono">
            <h2 className="text-sm font-semibold text-neutral-100 mb-4">Create New Resume Workspace</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Backend Engineering"
                  className="w-full px-3 py-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Role Track</label>
                <input
                  type="text"
                  value={modalRoleTrack}
                  onChange={(e) => setModalRoleTrack(e.target.value)}
                  placeholder="e.g. Distributed Systems / Go"
                  className="w-full px-3 py-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Resume Text</label>
                <textarea
                  required
                  rows={8}
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Paste initial resume text..."
                  className="w-full px-3 py-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold bg-[#faff69] text-[#090907]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'branch' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-lg w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg text-xs font-mono">
            <h2 className="text-sm font-semibold text-neutral-100 mb-4">Branch New Version</h2>
            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1">Version Label</label>
                <input
                  type="text"
                  required
                  value={modalVersionLabel}
                  onChange={(e) => setModalVersionLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69]"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Resume Text</label>
                <textarea
                  required
                  rows={8}
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-3 py-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded font-semibold bg-[#faff69] text-[#090907]"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === 'view_text' && viewingSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-2xl w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg text-xs font-mono flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <span className="font-semibold text-neutral-100">Snapshot Locked Text</span>
              <button onClick={() => setModalMode(null)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-4 bg-[#141410] border border-neutral-800/80 rounded text-neutral-300 leading-relaxed font-sans">
              {viewingSnapshot.text}
            </div>
            <div className="pt-3 text-[10px] text-neutral-500 flex justify-between">
              <span>SHA-256: {viewingSnapshot.hash}</span>
              <span>{viewingSnapshot.wordCount} words · {viewingSnapshot.charCount} chars</span>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'compare' && compareDiff && compareLabels && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-3xl w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg text-xs font-mono flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
              <span className="font-semibold text-neutral-100">
                Word Diff: {compareLabels.v1} vs {compareLabels.v2}
              </span>
              <button onClick={() => setModalMode(null)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-4 bg-[#141410] border border-neutral-800/80 rounded leading-relaxed font-sans">
              {compareDiff.map((tok, i) => {
                if (tok.type === 'add') {
                  return (
                    <span key={i} className="bg-emerald-950/60 text-emerald-300 underline decoration-emerald-500">
                      +{tok.text}
                    </span>
                  );
                }
                if (tok.type === 'remove') {
                  return (
                    <span key={i} className="bg-red-950/60 text-red-400 line-through">
                      {tok.text}
                    </span>
                  );
                }
                return <span key={i} className="text-neutral-300">{tok.text}</span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeMatrixPage;
