import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySpaceStore } from './useMySpaceStore';
import { humanizeEnum } from '@/lib/ui/copy';
import { toast } from '@/components/ui/Toast';
import { Copy, Check, ExternalLink, Trash2, Search } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'all' | OutreachStatus>('all');
  const [query, setQuery] = useState('');

  const draftsList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.values(outreachDrafts)
      .filter((d) => (statusFilter === 'all' ? true : d.status === statusFilter))
      .filter((d) =>
        !q
          ? true
          : (d.slots.person || '').toLowerCase().includes(q) ||
            (d.slots.company || '').toLowerCase().includes(q) ||
            d.renderedText.toLowerCase().includes(q)
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [outreachDrafts, statusFilter, query]);

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
      <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mb-2">
        Outreach Vault
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-5">
        Outreach
      </h2>

      {Object.keys(outreachDrafts).length > 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#10100d] border border-[#24241c]">
            {(['all', 'draft', 'sent', 'replied'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize cursor-pointer ${
                  statusFilter === tab ? 'bg-[#1b1b15] text-[#faff69]' : 'text-[#9b9b8c] hover:text-[#f1f1e8]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9b9b8c]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter contact or message..."
              aria-label="Filter outreach drafts"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#10100d] border border-[#24241c] text-xs text-[#f1f1e8] placeholder-[#9b9b8c]/70 focus:outline-none focus:border-[#faff69]"
            />
          </div>
        </div>
      )}

      {Object.keys(outreachDrafts).length === 0 ? (
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
      ) : draftsList.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#24241c] bg-[#10100d] text-center text-sm text-[#9b9b8c]">
          No outreach drafts match your current filter.
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
                    <div className="text-xs text-[#9b9b8c] font-mono mt-0.5">
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
                      className="p-2 rounded-full text-[#9b9b8c] hover:text-[#ff8a70] hover:bg-[#16160f] transition-colors cursor-pointer"
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

