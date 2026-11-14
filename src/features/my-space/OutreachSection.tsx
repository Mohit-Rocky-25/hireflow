import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySpaceStore } from './useMySpaceStore';
import { humanizeEnum } from '@/lib/ui/copy';
import { toast } from '@/components/ui/Toast';
import { Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import type { OutreachDraft, OutreachStatus } from '@/domain/types';

interface OutreachSectionProps {
  outreachDrafts?: Record<string, OutreachDraft>;
}

export const OutreachSection: React.FC<OutreachSectionProps> = ({ outreachDrafts: propDrafts }) => {
  const navigate = useNavigate();
  const storeOutreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const updateOutreachStatus = useMySpaceStore((s) => s.updateOutreachStatus);
  const removeOutreachDraft = useMySpaceStore((s) => s.removeOutreachDraft);
  const restoreOutreachDraft = useMySpaceStore((s) => s.restoreOutreachDraft);

  const outreachDrafts = propDrafts ?? storeOutreachDrafts;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const draftsList = Object.values(outreachDrafts).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const handleCopy = async (draft: OutreachDraft) => {
    try {
      await navigator.clipboard.writeText(draft.renderedText);
      setCopiedId(draft.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast('success', 'Message copied to clipboard.');
    } catch {
      toast('error', 'Failed to copy message.');
    }
  };

  const handleRemove = (draft: OutreachDraft) => {
    removeOutreachDraft(draft.id);
    toast('info', 'Removed outreach draft.', 8000, {
      label: 'Undo',
      onClick: () => {
        restoreOutreachDraft(draft);
      },
    });
  };

  const handleOpenInReachOut = (draft: OutreachDraft) => {
    const params = new URLSearchParams();
    if (draft.slots.company) params.set('company', draft.slots.company);
    if (draft.slots.person) params.set('person', draft.slots.person);
    navigate(`/tools/reach-out?${params.toString()}`);
  };

  return (
    <div className="max-w-[900px]">
      <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase mb-2">
        Outreach Vault
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-6">
        Outreach
      </h2>

      {draftsList.length === 0 ? (
        <div className="py-12 text-center border border-[#24241c] rounded-xl bg-[#10100d] p-8">
          <p className="text-[#9b9b8c] text-sm mb-4">No outreach drafts saved yet.</p>
          <button
            type="button"
            onClick={() => navigate('/tools/reach-out')}
            className="inline-block px-5 py-2.5 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer"
          >
            Create an Outreach Message
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {draftsList.map((draft) => {
            const isCopied = copiedId === draft.id;
            const person = draft.slots.person || 'Contact';
            const company = draft.slots.company || '';

            return (
              <div
                key={draft.id}
                className="p-5 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-col gap-4"
              >
                <div className="flex max-sm:flex-col sm:items-center justify-between gap-3 pb-3 border-b border-[#24241c]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base text-[#f1f1e8]">{person}</span>
                      {company && (
                        <span className="text-xs text-[#9b9b8c] font-medium">at {company}</span>
                      )}
                    </div>
                    <div className="text-xs text-[#6d6d61] font-mono mt-0.5">
                      {humanizeEnum(draft.channel)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`outreach-status-${draft.id}`}>
                      Status for {person}
                    </label>
                    <select
                      id={`outreach-status-${draft.id}`}
                      value={draft.status}
                      onChange={(e) =>
                        updateOutreachStatus(draft.id, e.target.value as OutreachStatus)
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-xs outline-none focus:border-[#faff69]"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="replied">Replied</option>
                    </select>

                    <button
                      type="button"
                      aria-label={`Remove draft for ${person}`}
                      onClick={() => handleRemove(draft)}
                      className="p-2 rounded-full text-[#6d6d61] hover:text-[#ff8a70] hover:bg-[#16160f] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Draft content */}
                <div className="p-4 rounded-lg bg-[#090907] border border-[#1b1b15] text-[13.5px] leading-relaxed text-[#d9d9cd] whitespace-pre-wrap font-sans">
                  {draft.renderedText}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopy(draft)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 hover:text-[#faff69] transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#faff69]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy message</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInReachOut(draft)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16160f] border border-[#24241c] text-xs font-semibold text-[#faff69] hover:bg-[#24241c] transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Reach Out</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

