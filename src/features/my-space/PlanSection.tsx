import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySpaceStore } from './useMySpaceStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { humanizeEnum } from '@/lib/ui/copy';
import { toast } from '@/components/ui/Toast';
import { Plus, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';
import type { PlanItem, PlanStatus, PlanKind } from '@/domain/types';

interface PlanSectionProps {
  planItems?: Record<string, PlanItem>;
}

export const PlanSection: React.FC<PlanSectionProps> = ({ planItems: propPlanItems }) => {
  const navigate = useNavigate();
  const storePlanItems = useMySpaceStore((s) => s.planItems);
  const planItems = propPlanItems ?? storePlanItems;
  const addPlanItem = useMySpaceStore((s) => s.addPlanItem);
  const updatePlanItemStatus = useMySpaceStore((s) => s.updatePlanItemStatus);
  const removePlanItem = useMySpaceStore((s) => s.removePlanItem);
  const restorePlanItem = useMySpaceStore((s) => s.restorePlanItem);
  const markGapAddressed = useAuditStore((s) => s.markGapAddressed);

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<PlanKind>('build_brief');

  const itemsList = Object.values(planItems);

  const handleStatusChange = (item: PlanItem, newStatus: PlanStatus) => {
    updatePlanItemStatus(item.id, newStatus);
    if (newStatus === 'done' && item.targetKey && item.linkedGapIds?.length) {
      item.linkedGapIds.forEach((gapId) => {
        markGapAddressed(item.targetKey!, gapId, item.id);
      });
    }
  };

  const handleRemove = (item: PlanItem) => {
    removePlanItem(item.id);
    toast('info', 'Removed plan item.', 8000, {
      label: 'Undo',
      onClick: () => {
        restorePlanItem(item);
      },
    });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    addPlanItem({
      kind,
      refId: `manual-${Date.now()}`,
      title: t,
      status: 'planned',
      linkedGapIds: [],
      targetKey: undefined,
      addedFromAuditId: null,
    });

    setTitle('');
    setIsAdding(false);
  };

  const groups: Array<{ status: PlanStatus; title: string; items: PlanItem[] }> = [
    {
      status: 'planned',
      title: 'Planned',
      items: itemsList.filter((i) => i.status === 'planned'),
    },
    {
      status: 'in_progress',
      title: 'In Progress',
      items: itemsList.filter((i) => i.status === 'in_progress'),
    },
    {
      status: 'done',
      title: 'Done',
      items: itemsList.filter((i) => i.status === 'done'),
    },
  ];

  return (
    <div className="max-w-[900px]">
      <div className="flex justify-between items-baseline mb-2">
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase">
          Skill Plan
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 hover:text-[#faff69] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add item</span>
        </button>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-6">
        Plan
      </h2>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-6 p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            placeholder="Item title (e.g. AWS Solutions Architect Associate)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
            autoFocus
          />
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as PlanKind)}
            className="px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
          >
            <option value="build_brief">Build brief</option>
            <option value="credential">Credential</option>
          </select>
          <button
            type="submit"
            className="h-[38px] px-4 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer shrink-0"
          >
            Save Item
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="h-[38px] px-3 rounded-full border border-[#24241c] text-[#9b9b8c] text-xs font-semibold hover:text-[#f1f1e8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {itemsList.length === 0 ? (
        <div className="py-12 text-center border border-[#24241c] rounded-xl bg-[#10100d] p-8">
          <p className="text-[#9b9b8c] text-sm mb-4">Your plan is currently empty.</p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-block px-5 py-2.5 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <div key={group.status} className="border border-[#24241c] rounded-xl bg-[#10100d] p-5">
                <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-[#24241c]">
                  <h3 className="text-base font-bold text-[#f1f1e8]">{group.title}</h3>
                  <span className="text-xs font-mono text-[#6d6d61]">
                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="divide-y divide-[#1b1b15]">
                  {group.items.map((item) => {
                    const isDone = item.status === 'done';
                    return (
                      <div
                        key={item.id}
                        className="py-4 flex max-sm:flex-col sm:items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#f1f1e8]">
                            {item.title}
                          </div>
                          <div className="text-xs text-[#9b9b8c] mt-0.5">
                            {humanizeEnum(item.kind)}
                            {item.linkedGapIds?.length
                              ? ` · Addresses ${item.linkedGapIds.length} ${item.linkedGapIds.length === 1 ? 'gap' : 'gaps'}`
                              : ''}
                          </div>

                          {isDone && item.linkedGapIds?.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30 font-medium">
                                Addressed, waiting for a re-scan
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const url = item.targetKey
                                    ? `/tools/resume-checker?targetKey=${encodeURIComponent(item.targetKey)}`
                                    : '/tools/resume-checker';
                                  navigate(url);
                                }}
                                className="text-xs font-semibold text-[#faff69] hover:underline cursor-pointer"
                              >
                                Re-scan now
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <label className="sr-only" htmlFor={`status-${item.id}`}>
                            Status for {item.title}
                          </label>
                          <select
                            id={`status-${item.id}`}
                            value={item.status}
                            onChange={(e) => handleStatusChange(item, e.target.value as PlanStatus)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-xs outline-none focus:border-[#faff69]"
                          >
                            <option value="planned">Planned</option>
                            <option value="in_progress">In progress</option>
                            <option value="done">Done</option>
                          </select>

                          <button
                            type="button"
                            aria-label={`Remove ${item.title}`}
                            onClick={() => handleRemove(item)}
                            className="p-2 rounded-full text-[#6d6d61] hover:text-[#ff8a70] hover:bg-[#16160f] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

