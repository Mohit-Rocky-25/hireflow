// ============================================================
// HireFlow — Interview Evidence Checklist Panel (Interviewer View)
// Stage 7.2: Role Integration
// Interactive fact-checking checklist for live interviews:
// identifies skills <= Level 2, unverified claims, and provides
// verbatim claim verification checkboxes with local scratchpad notes.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  AlertCircle,
  FileCheck2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  Copy,
  Check,
  ClipboardCheck,
} from 'lucide-react';
import {
  decodeCard,
  CardDataPayload,
  CompactCardEnvelope,
} from '../../../features/suite/share/cardCodec';
import { EvidenceLevel } from '../../../features/suite/profile/types';

interface VerificationItem {
  id: string;
  skill: string;
  evidenceLevel: EvidenceLevel;
  quote?: string;
  isFlaggedForCheck: boolean;
  verified: boolean;
  interviewerNote: string;
}

interface InterviewEvidenceChecklistPanelProps {
  candidateName: string;
  candidateSkills?: string[];
  jobTitle: string;
  onAppendFeedback?: (text: string) => void;
}

export function InterviewEvidenceChecklistPanel({
  candidateName,
  candidateSkills = [],
  jobTitle,
  onAppendFeedback,
}: InterviewEvidenceChecklistPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [loadedCard, setLoadedCard] = useState<CompactCardEnvelope | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Verification items list
  const [items, setItems] = useState<VerificationItem[]>(() => {
    // Default initial mock items from candidate skills
    const baseSkills = candidateSkills.length > 0 ? candidateSkills : ['Docker', 'Kafka', 'PostgreSQL', 'TypeScript'];
    return baseSkills.map((skill, idx) => {
      const level: EvidenceLevel = ((idx % 3) as EvidenceLevel); // 0, 1, 2
      const quotes = [
        `Claimed hands-on architecture of ${skill} pipeline (no code repo cited)`,
        `Listed ${skill} under tools section without quantitative metrics`,
        `Assisted backend engineers with ${skill} config maintenance`,
      ];
      return {
        id: `check-${idx}`,
        skill,
        evidenceLevel: level,
        quote: quotes[level] || `Claimed ${skill} experience`,
        isFlaggedForCheck: level <= 2,
        verified: false,
        interviewerNote: '',
      };
    });
  });

  // Load from candidate profile or sample
  const handleLoadSample = () => {
    setDecodeError(null);
    const newItems: VerificationItem[] = [
      {
        id: 'chk-1',
        skill: 'Distributed Caching / Redis',
        evidenceLevel: 2,
        quote: 'Designed caching layer for rate limiting (no metrics cited in resume)',
        isFlaggedForCheck: true,
        verified: false,
        interviewerNote: '',
      },
      {
        id: 'chk-2',
        skill: 'Kafka / Event Ingestion',
        evidenceLevel: 1,
        quote: 'Listed Kafka in Skills section; no project bullets describe partition sizing',
        isFlaggedForCheck: true,
        verified: false,
        interviewerNote: '',
      },
      {
        id: 'chk-3',
        skill: 'PostgreSQL Ledger Schema',
        evidenceLevel: 2,
        quote: 'Worked with database schemas; test consistency guarantees and ACID isolation',
        isFlaggedForCheck: true,
        verified: false,
        interviewerNote: '',
      },
      {
        id: 'chk-4',
        skill: 'TypeScript / API Gateway',
        evidenceLevel: 4,
        quote: 'Verifiable repo cited with 92% unit test coverage',
        isFlaggedForCheck: false,
        verified: true,
        interviewerNote: 'Verified repo architecture on GitHub.',
      },
    ];
    setItems(newItems);
  };

  const handleDecode = async () => {
    setDecodeError(null);
    let str = inputUrl.trim();
    if (!str) return;
    if (str.includes('#')) str = str.split('#')[1] || '';

    const res = await decodeCard(str);
    if (res.ok && res.envelope) {
      setLoadedCard(res.envelope);
      const cardSkills = res.envelope.data.skills || [];
      const newItems: VerificationItem[] = cardSkills.map((s, idx) => ({
        id: `card-skill-${idx}`,
        skill: s.name,
        evidenceLevel: s.evidenceLevel,
        quote: s.quote,
        isFlaggedForCheck: s.evidenceLevel <= 2,
        verified: s.evidenceLevel >= 3,
        interviewerNote: s.evidenceLevel >= 3 ? 'Backed by L3/L4 metric on card' : '',
      }));
      setItems(newItems);
    } else {
      setDecodeError(res.error || 'Failed to decode card');
    }
  };

  const toggleVerified = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verified: !item.verified } : item))
    );
  };

  const updateNote = (id: string, note: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, interviewerNote: note } : item))
    );
  };

  // Flagged items count
  const flaggedCount = useMemo(() => items.filter((i) => i.isFlaggedForCheck).length, [items]);
  const verifiedCount = useMemo(() => items.filter((i) => i.verified).length, [items]);

  const handleAppendNotes = () => {
    if (!onAppendFeedback) return;
    const summary = [
      `--- Live Evidence Verification Checklist (${jobTitle}) ---`,
      ...items.map((i) => {
        const status = i.verified ? '[PASSED]' : '[FLAGGED / UNVERIFIED]';
        const note = i.interviewerNote ? ` | Note: ${i.interviewerNote}` : '';
        return `• ${i.skill} (L${i.evidenceLevel}) ${status}${note}`;
      }),
    ].join('\n');

    onAppendFeedback(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="bg-surface rounded-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Evidence to Verify (Level 0–2 Checklist)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {flaggedCount} to Probe
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Live fact-checking checklist for claims lacking code proofs or quantitative metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-foreground transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            Load Card
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-surface-2 text-muted"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-1">
          {/* Card URL input option */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste candidate Evidence Card link to populate..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface-2 border border-border text-foreground font-mono focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleDecode}
              className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-foreground rounded-lg transition-colors"
            >
              Sync
            </button>
          </div>
          {decodeError && (
            <p className="text-xs text-danger">{decodeError}</p>
          )}

          {/* Checklist items */}
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                  item.verified
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : item.isFlaggedForCheck
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-surface-2 border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleVerified(item.id)}
                      className="mt-0.5 text-muted hover:text-foreground shrink-0"
                    >
                      {item.verified ? (
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 text-muted" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.skill}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.evidenceLevel >= 3
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : item.evidenceLevel >= 2
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          Level {item.evidenceLevel}
                        </span>
                        {item.isFlaggedForCheck && !item.verified && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> Needs Probe
                          </span>
                        )}
                      </div>
                      {item.quote && (
                        <p className="text-[11px] text-muted italic mt-0.5">
                          "{item.quote}"
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted shrink-0">
                    {item.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* Live Interviewer Note */}
                <div className="pt-1">
                  <input
                    type="text"
                    value={item.interviewerNote}
                    onChange={(e) => updateNote(item.id, e.target.value)}
                    placeholder="Candidate response / technical depth notes..."
                    className="w-full px-2.5 py-1 text-[11px] rounded bg-surface border border-border text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action: Append to feedback form */}
          {onAppendFeedback && (
            <div className="pt-2 flex items-center justify-between border-t border-border">
              <span className="text-[11px] text-muted">
                {verifiedCount} of {items.length} claims verified
              </span>
              <button
                type="button"
                onClick={handleAppendNotes}
                className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-foreground rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Appended!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-primary" /> Insert Checklist Into Feedback
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
