import React, { useState } from 'react';
import { usePortalStore } from './usePortalStore';
import { Panel } from './components/Panel';
import { EmptyState } from './components/EmptyState';
import type { OutreachDraft, OutreachStatus, Uuid } from '@/domain/types';
import { Copy, Check, Trash2, Mail, Send, MessageSquare } from 'lucide-react';

interface OutreachVaultProps {
  outreachDrafts?: Record<Uuid, OutreachDraft>;
}

export const OutreachVault: React.FC<OutreachVaultProps> = ({
  outreachDrafts: propDrafts,
}) => {
  const storeDrafts = usePortalStore((s) => s.outreachDrafts);
  const drafts = propDrafts ?? storeDrafts;
  const updateOutreachStatus = usePortalStore((s) => s.updateOutreachStatus);
  const removeOutreachDraft = usePortalStore((s) => s.removeOutreachDraft);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OutreachStatus | 'all'>('all');

  const draftList: OutreachDraft[] = Object.values(drafts);
  const filteredDrafts = draftList
    .filter((d) => filterStatus === 'all' || d.status === filterStatus)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const statusOptions: OutreachStatus[] = ['draft', 'sent', 'replied', 'archived'];

  return (
    <Panel
      title="Outreach Vault"
      count={draftList.length}
      subtitle="Saved cold outreach templates, recruiter pitches, and message states"
      action={
        <div className="flex items-center gap-1 font-mono text-xs">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OutreachStatus | 'all')}
            className="bg-[#141410] border border-neutral-800 text-neutral-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-[#faff69]"
          >
            <option value="all">All Statuses ({draftList.length})</option>
            <option value="draft">Drafts</option>
            <option value="sent">Sent</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      }
    >
      {filteredDrafts.length === 0 ? (
        <EmptyState
          message="No saved outreach messages"
          description="Personalized cold outreach emails, LinkedIn connect notes, and referral pitches will appear here once saved from the reach out tools."
        />
      ) : (
        <div className="space-y-3">
          {filteredDrafts.map((draft) => {
            const isCopied = copiedId === draft.id;
            const target = draft.slots.company || draft.targetKey || 'General';
            const recipient = draft.slots.recipientName || draft.slots.role || 'Hiring Lead';

            return (
              <div
                key={draft.id}
                className="p-3.5 rounded border border-neutral-800 bg-[#0c0c0a] hover:border-neutral-700 transition-colors font-mono text-xs space-y-2.5"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                      <Mail className="w-3 h-3 text-[#faff69]" />
                      <span>{draft.channel || 'Email'}</span>
                    </span>

                    <span className="font-bold text-neutral-200 truncate">
                      {target}
                    </span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-400 truncate">
                      {recipient}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        updateOutreachStatus(draft.id, e.target.value as OutreachStatus)
                      }
                      className="bg-[#141410] border border-neutral-800 text-neutral-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-[#faff69]"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.toUpperCase()}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeOutreachDraft(draft.id)}
                      title="Delete draft"
                      className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rendered Text Box */}
                <div className="p-2.5 rounded bg-[#070705] border border-neutral-900 text-neutral-300 text-[11px] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto custom-scrollbar font-mono">
                  {draft.renderedText}
                </div>

                {/* Footer action bar */}
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>
                    Saved {new Date(draft.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(draft.id, draft.renderedText)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-[#141410] text-neutral-200 hover:text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer text-xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
