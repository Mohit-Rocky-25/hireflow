import React, { useState } from 'react';
import { usePortalStore } from './usePortalStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { Panel } from './components/Panel';
import { EmptyState } from './components/EmptyState';
import type { PlanItem, PlanStatus, PlanKind, Uuid } from '@/domain/types';
import { Plus, CheckCircle, Clock, Circle, Trash2, Award, FileCode } from 'lucide-react';

interface ExecutionPlanProps {
  planItems?: Record<Uuid, PlanItem>;
}

export const ExecutionPlan: React.FC<ExecutionPlanProps> = ({
  planItems: propPlanItems,
}) => {
  const storePlanItems = usePortalStore((s) => s.planItems);
  const planItems = propPlanItems ?? storePlanItems;
  const addPlanItem = usePortalStore((s) => s.addPlanItem);
  const updatePlanItemStatus = usePortalStore((s) => s.updatePlanItemStatus);
  const removePlanItem = usePortalStore((s) => s.removePlanItem);

  const [activeTab, setActiveTab] = useState<PlanStatus | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<PlanKind>('build_brief');

  const itemsList: PlanItem[] = Object.values(planItems);
  const filteredItems = itemsList
    .filter((it) => activeTab === 'all' || it.status === activeTab)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

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
      addedFromAuditId: null,
    });

    setTitle('');
    setIsAdding(false);
  };

  const handleStatusChange = (item: PlanItem, newStatus: PlanStatus) => {
    updatePlanItemStatus(item.id, newStatus);
    if (newStatus === 'done' && item.targetKey && item.linkedGapIds?.length) {
      const markAddressed = useAuditStore.getState().markGapAddressed;
      item.linkedGapIds.forEach((gapId) => {
        markAddressed(item.targetKey!, gapId, item.id);
      });
    }
  };

  const tabs: Array<{ label: string; value: PlanStatus | 'all'; count: number }> = [
    { label: 'All', value: 'all', count: itemsList.length },
    {
      label: 'Planned',
      value: 'planned',
      count: itemsList.filter((i) => i.status === 'planned').length,
    },
    {
      label: 'In Progress',
      value: 'in_progress',
      count: itemsList.filter((i) => i.status === 'in_progress').length,
    },
    {
      label: 'Done',
      value: 'done',
      count: itemsList.filter((i) => i.status === 'done').length,
    },
  ];

  return (
    <Panel
      title="Execution Plan"
      count={itemsList.length}
      subtitle="Actionable credential paths and build briefs resolving flagged gaps"
      action={
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      }
    >
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 mb-3 font-mono text-xs border-b border-neutral-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.value
                ? 'bg-[#141410] text-[#faff69] border border-[#faff69]/30 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] text-neutral-500">({tab.count})</span>
          </button>
        ))}
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-3 rounded border border-neutral-800 bg-[#141410] font-mono text-xs space-y-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Task title (e.g. Implement Distributed Raft Consensus in Go)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded bg-[#090907] border border-neutral-700 text-neutral-100 placeholder-neutral-500 outline-none focus:border-[#faff69]"
              autoFocus
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as PlanKind)}
              className="px-2 py-1.5 rounded bg-[#090907] border border-neutral-700 text-neutral-200 outline-none focus:border-[#faff69]"
            >
              <option value="build_brief">Build Brief</option>
              <option value="credential">Credential</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3 py-1 rounded bg-[#faff69] text-black font-semibold hover:bg-[#e5eb5d] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState
          message="No tasks matching this status"
          description="Build briefs and recommended credentials can be attached directly from audit findings or created manually."
          action={{
            label: "Create a task",
            onClick: () => setIsAdding(true),
          }}
        />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded border transition-colors font-mono text-xs flex items-start justify-between gap-3 ${
                item.status === 'done'
                  ? 'border-neutral-900 bg-[#0a0a08] opacity-75'
                  : 'border-neutral-800 bg-[#0c0c0a] hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      item,
                      item.status === 'done' ? 'in_progress' : 'done'
                    )
                  }
                  title={`Mark as ${item.status === 'done' ? 'in progress' : 'done'}`}
                  className="mt-0.5 text-neutral-400 hover:text-[#faff69] transition-colors cursor-pointer shrink-0"
                >
                  {item.status === 'done' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : item.status === 'in_progress' ? (
                    <Clock className="w-4 h-4 text-[#faff69]" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-600" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div
                    className={`font-medium ${
                      item.status === 'done'
                        ? 'line-through text-neutral-500'
                        : 'text-neutral-200'
                    }`}
                  >
                    {item.title}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
                    <span className="flex items-center gap-1">
                      {item.kind === 'credential' ? (
                        <Award className="w-3 h-3 text-[#faff69]" />
                      ) : (
                        <FileCode className="w-3 h-3 text-cyan-400" />
                      )}
                      <span className="capitalize">{item.kind.replace('_', ' ')}</span>
                    </span>

                    {item.linkedGapIds?.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400/80">
                          {item.linkedGapIds.length} linked {item.linkedGapIds.length === 1 ? 'gap' : 'gaps'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Select & Remove */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusChange(item, e.target.value as PlanStatus)
                  }
                  className="bg-[#141410] border border-neutral-800 text-neutral-300 rounded px-2 py-0.5 text-[11px] outline-none focus:border-[#faff69]"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button
                  type="button"
                  onClick={() => removePlanItem(item.id)}
                  title="Delete task"
                  className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};
