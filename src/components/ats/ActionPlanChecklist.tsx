import React, { useState, useEffect } from 'react';
import { CalendarCheck2, CheckSquare, Square, Rocket, RotateCcw } from 'lucide-react';

interface Props {
  sevenDayPlan: Array<{
    day: number;
    task: string;
    outcome: string;
  }>;
  thirtyDayPlan: Array<{
    week: number;
    focus: string;
    deliverable: string;
  }>;
}

export const ActionPlanChecklist: React.FC<Props> = ({ sevenDayPlan, thirtyDayPlan }) => {
  const [activeTab, setActiveTab] = useState<'7day' | '30day'>('7day');
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hireflow_ats_action_plan');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hireflow_ats_action_plan', JSON.stringify(checkedTasks));
    } catch {
      // ignore
    }
  }, [checkedTasks]);

  const toggleTask = (key: string) => {
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetTasks = () => {
    setCheckedTasks({});
  };

  const total7Day = sevenDayPlan.length;
  const completed7Day = sevenDayPlan.filter((_, idx) => checkedTasks[`7d_${idx}`]).length;

  const total30Day = thirtyDayPlan.length;
  const completed30Day = thirtyDayPlan.filter((_, idx) => checkedTasks[`30d_${idx}`]).length;

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-success" /> Tactical Action Plan
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Step-by-step roadmap to eliminate rejection flags and secure engineering interviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5 bg-surface-2 border border-border">
            <button
              onClick={() => setActiveTab('7day')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === '7day' ? 'bg-surface text-text shadow-xs' : 'text-text-muted hover:text-text'
              }`}
            >
              7-Day Sprint ({completed7Day}/{total7Day})
            </button>
            <button
              onClick={() => setActiveTab('30day')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                activeTab === '30day' ? 'bg-surface text-text shadow-xs' : 'text-text-muted hover:text-text'
              }`}
            >
              30-Day Blueprint ({completed30Day}/{total30Day})
            </button>
          </div>

          <button
            onClick={resetTasks}
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-md transition-colors"
            title="Reset Checklist"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeTab === '7day' ? (
        <div className="space-y-3">
          {sevenDayPlan.map((item, idx) => {
            const isDone = !!checkedTasks[`7d_${idx}`];
            return (
              <div
                key={idx}
                onClick={() => toggleTask(`7d_${idx}`)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-success-bg/30 border-success/30 opacity-75'
                    : 'bg-surface-2/60 border-border hover:border-primary/40'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-primary">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-success" />
                  ) : (
                    <Square className="w-4 h-4 text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface border border-border">
                      Day {item.day}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isDone ? 'line-through text-text-muted' : 'text-text'
                      }`}
                    >
                      {item.task}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    <strong className="text-text font-semibold">Deliverable:</strong> {item.outcome}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {thirtyDayPlan.map((item, idx) => {
            const isDone = !!checkedTasks[`30d_${idx}`];
            return (
              <div
                key={idx}
                onClick={() => toggleTask(`30d_${idx}`)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isDone
                    ? 'bg-success-bg/30 border-success/30 opacity-75'
                    : 'bg-surface-2/60 border-border hover:border-ai/40'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-ai">
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-success" />
                  ) : (
                    <Square className="w-4 h-4 text-text-muted" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface border border-border">
                      Week {item.week}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isDone ? 'line-through text-text-muted' : 'text-text'
                      }`}
                    >
                      {item.focus}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    <strong className="text-text font-semibold">Deliverable:</strong> {item.deliverable}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
