import { useState, useEffect } from 'react';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { kvGet } from '@/lib/storage/kv';
import { getSnapshotKey } from '@/lib/storage/namespace';
import { diffWords, type DiffOp } from '@/lib/text/diff';
import type { AuditEntry, TextSnapshot, Uuid } from '@/domain/types';

export interface InspectorState {
  audit: AuditEntry | null;
  resumeText: string | null;
  jdText: string | null;
  isLoading: boolean;
  error: string | null;

  // Comparison
  compareAuditId: Uuid | null;
  compareAudit: AuditEntry | null;
  compareResumeText: string | null;
  wordDiffs: DiffOp[] | null;
  availableCompareAudits: AuditEntry[];

  // Active finding / selection
  selectedFindingId: string | null;
  activeTab: 'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw';

  setCompareAuditId: (id: Uuid | null) => void;
  setSelectedFindingId: (id: string | null) => void;
  setActiveTab: (tab: 'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw') => void;
}

export function useInspectorState(auditId: string | undefined): InspectorState {
  const entries = useAuditStore((s) => s.entries);
  const audit = auditId ? entries[auditId] ?? null : null;

  const [resumeText, setResumeText] = useState<string | null>(null);
  const [jdText, setJdText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [compareAuditId, setCompareAuditId] = useState<Uuid | null>(null);
  const [compareResumeText, setCompareResumeText] = useState<string | null>(null);
  const [wordDiffs, setWordDiffs] = useState<DiffOp[] | null>(null);

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw'>('breakdown');

  // Find other audits for the same targetKey
  const availableCompareAudits = Object.values(entries).filter(
    (e) => audit && e.id !== audit.id && e.targetKey === audit.targetKey
  );

  // Load primary snapshots
  useEffect(() => {
    let isCancelled = false;

    async function loadSnapshots() {
      if (!audit) {
        setIsLoading(false);
        setError('Audit not found');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const resumeSnapKey = getSnapshotKey(audit.resume.snapshotHash);
        const jdSnapKey = getSnapshotKey(audit.jd.snapshotHash);

        const [rSnap, jSnap] = await Promise.all([
          kvGet<TextSnapshot>(resumeSnapKey),
          kvGet<TextSnapshot>(jdSnapKey),
        ]);

        if (!isCancelled) {
          setResumeText(rSnap?.text ?? null);
          setJdText(jSnap?.text ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load snapshots');
          setIsLoading(false);
        }
      }
    }

    void loadSnapshots();

    return () => {
      isCancelled = true;
    };
  }, [audit]);

  // Load comparison audit and compute diff
  const compareAudit = compareAuditId ? entries[compareAuditId] ?? null : null;

  useEffect(() => {
    let isCancelled = false;

    async function loadCompareSnapshot() {
      if (!compareAudit || !resumeText) {
        setCompareResumeText(null);
        setWordDiffs(null);
        return;
      }

      try {
        const cSnapKey = getSnapshotKey(compareAudit.resume.snapshotHash);
        const cSnap = await kvGet<TextSnapshot>(cSnapKey);

        if (!isCancelled) {
          const compText = cSnap?.text ?? '';
          setCompareResumeText(compText);
          const diff = diffWords(resumeText, compText);
          setWordDiffs(diff);
        }
      } catch {
        if (!isCancelled) {
          setCompareResumeText(null);
          setWordDiffs(null);
        }
      }
    }

    void loadCompareSnapshot();

    return () => {
      isCancelled = true;
    };
  }, [compareAudit, resumeText]);

  return {
    audit,
    resumeText,
    jdText,
    isLoading,
    error,
    compareAuditId,
    compareAudit,
    compareResumeText,
    wordDiffs,
    availableCompareAudits,
    selectedFindingId,
    activeTab,
    setCompareAuditId,
    setSelectedFindingId,
    setActiveTab,
  };
}

