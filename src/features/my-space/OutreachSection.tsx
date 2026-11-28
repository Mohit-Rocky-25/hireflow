import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySpaceStore } from './useMySpaceStore';
import { humanizeEnum } from '@/lib/ui/copy';
import { toast } from '@/components/ui/Toast';
import { Copy, Check, ExternalLink, Trash2, Search, Send, Clock, Mail } from 'lucide-react';
import type { OutreachDraft, OutreachStatus } from '@/domain/types';

interface OutreachSectionProps {
  outreachDrafts?: Record<string, OutreachDraft>;
}

export const OutreachSection: React.FC<OutreachSectionProps> = ({ outreachDrafts: propDrafts }) => {
  const navigate = useNavigate();
  const storeOutreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const updateOutreachStatus = useMySpaceStore((s) => s.updateOutreachStatus);
  const markOutreachSent = useMySpaceStore((s) => s.markOutreachSent);
  const removeOutreachDraft = useMySpaceStore((s) => s.removeOutreachDraft);
  const restoreOutreachDraft = useMySpaceStore((s) => s.restoreOutreachDraft);

  const outreachDrafts = propDrafts ?? storeOutreachDrafts;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | OutreachStatus>('all');
  const [query, setQuery] = useState('');

  const childFollowUpParentIds = useMemo(
    () =>
      new Set(
        Object.values(outreachDrafts)
          .map((d) => d.parentDraftId)
          .filter((id): id is string => Boolean(id))
      ),
    [outreachDrafts]
  );

  const draftsList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.values(outreachDrafts)
      .filter((d) => (statusFilter === 'all' ? true : d.status === statusFilter))
      .filter((d) => {
        if (!q) return true;
        const person = d.person || d.slots?.person || '';
        const company = d.company || d.slots?.company || '';
        const role = d.targetRole || '';
        return (
          person.toLowerCase().includes(q) ||
          company.toLowerCase().includes(q) ||
          role.toLowerCase().includes(q) ||
          (d.subject || '').toLowerCase().includes(q) ||
          d.renderedText.toLowerCase().includes(q)
        );
      })
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
    navigate(`/tools/reach-out?draftId=${encodeURIComponent(draft.id)}`);
  };

  const handleDraftFollowUp = (draft: OutreachDraft) => {
    navigate(`/tools/reach-out?followUpFrom=${encodeURIComponent(draft.id)}`);
  };

  const buildMailtoHref = (draft: OutreachDraft): string | null => {
    if (draft.channel === 'linkedin_connect' || draft.channel === 'linkedin_inmail') {
      return null;
    }
    const body = draft.message ?? draft.renderedText.replace(/^Subject:\s*[^\r\n]+\r?\n\r?\n/, '');
    const params = new URLSearchParams();
    if (draft.subject) params.set('subject', draft.subject);
    params.set('body', body);
    return `mailto:?${params.toString().replace(/\+/g, '%20')}`;
  };

  const todayIsoDay = new Date().toISOString().slice(0, 10);

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
              placeholder="Filter contact, company, or role..."
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
            const person = draft.person || draft.slots?.person || 'Contact';
            const company = draft.company || draft.slots?.company || '';
            const hasChildFollowUp = childFollowUpParentIds.has(draft.id);
            const dueDay = draft.followUpDueAt ? draft.followUpDueAt.slice(0, 10) : null;
            const isFollowUpDue =
              draft.status === 'sent' && !hasChildFollowUp && Boolean(dueDay && dueDay <= todayIsoDay);
            const isOverdue = Boolean(isFollowUpDue && dueDay && dueDay < todayIsoDay);
            const mailtoHref = buildMailtoHref(draft);

            return (
              <div
                key={draft.id}
                className="p-5 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-col gap-4"
              >
                <div className="flex max-sm:flex-col sm:items-center justify-between gap-3 pb-3 border-b border-[#24241c]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-base text-[#f1f1e8]">{person}</span>
                      {company && (
                        <span className="text-xs text-[#9b9b8c] font-medium">at {company}</span>
                      )}
                      {draft.targetRole && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16160f] border border-[#24241c] text-[#9b9b8c]">
                          {draft.targetRole}
                        </span>
                      )}
                      {draft.isIncomplete && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                          Incomplete Draft
                        </span>
                      )}
                      {draft.parentDraftId && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
                          Follow-Up
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#9b9b8c] font-mono mt-1 flex flex-wrap items-center gap-2">
                      <span>{humanizeEnum(draft.channel)}</span>
                      {draft.intent && <span>&middot; {humanizeEnum(draft.intent)}</span>}
                      {draft.sentAt && (
                        <span>&middot; Sent {new Date(draft.sentAt).toLocaleDateString()}</span>
                      )}
                      {dueDay && draft.status === 'sent' && !hasChildFollowUp && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ${
                            isOverdue
                              ? 'border-rose-500/40 bg-rose-950/40 text-rose-300'
                              : isFollowUpDue
                              ? 'border-[#faff69]/40 bg-[#faff69]/10 text-[#faff69]'
                              : 'border-[#24241c] text-[#9b9b8c]'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>
                            {isOverdue
                              ? `Follow-up overdue (${dueDay})`
                              : isFollowUpDue
                              ? `Follow-up due today`
                              : `Follow-up due ${dueDay}`}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
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
                <div className="p-4 rounded-lg bg-[#090907] border border-[#1b1b15] text-[13.5px] leading-relaxed text-[#d9d9cd] whitespace-pre-wrap font-sans space-y-2">
                  {draft.subject && (
                    <div className="text-xs font-semibold text-[#f1f1e8] border-b border-[#1b1b15] pb-1.5">
                      Subject: {draft.subject}
                    </div>
                  )}
                  <div>
                    {draft.message ?? draft.renderedText.replace(/^Subject:\s*[^\r\n]+\r?\n\r?\n/, '')}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
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

                  {mailtoHref && (
                    <a
                      href={mailtoHref}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#faff69]" />
                      <span>Open Email App</span>
                    </a>
                  )}

                  {draft.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => markOutreachSent(draft.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Mark as Sent</span>
                    </button>
                  )}

                  {draft.status === 'sent' && !hasChildFollowUp && (
                    <button
                      type="button"
                      onClick={() => handleDraftFollowUp(draft)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#faff69]/40 bg-[#faff69]/10 text-xs font-semibold text-[#faff69] hover:bg-[#faff69] hover:text-[#090907] transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Draft Follow-Up</span>
                    </button>
                  )}

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
