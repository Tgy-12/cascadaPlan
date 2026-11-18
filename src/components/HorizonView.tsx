import React, { useState } from 'react';
import { PlanGoal, TimeHorizon, HORIZONS } from '../types';
import { GoalNode } from './GoalNode';
import { Search, Filter, Plus, Layers, CheckCircle2 } from 'lucide-react';

interface HorizonViewProps {
  goals: PlanGoal[];
  onToggleGoal: (id: string) => void;
  onSelectGoal: (goal: PlanGoal) => void;
  onBreakDown: (parentGoal: PlanGoal) => void;
  onOpenQuickAdd: (opts: { horizon?: TimeHorizon; parentId?: string | null }) => void;
}

export const HorizonView: React.FC<HorizonViewProps> = ({
  goals,
  onToggleGoal,
  onSelectGoal,
  onBreakDown,
  onOpenQuickAdd,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'completed'>('all');

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    // Horizon filter
    if (selectedHorizon !== 'all' && g.horizon !== selectedHorizon) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = g.title.toLowerCase().includes(q);
      const matchDesc = g.description.toLowerCase().includes(q);
      const matchTag = g.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Status filter
    if (statusFilter === 'todo' && g.status === 'completed') return false;
    if (statusFilter === 'completed' && g.status !== 'completed') return false;

    return true;
  });

  // Top-level root goals (goals that have no parent, or if filtered to a specific horizon, all goals of that horizon)
  const rootGoals =
    selectedHorizon === 'all'
      ? filteredGoals.filter((g) => !g.parentId)
      : filteredGoals;

  // Global metrics
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Total Goals & Tasks
          </span>
          <div className="text-xl font-bold mt-1 text-[var(--text-main)]">{totalCount}</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Completed Items
          </span>
          <div className="text-xl font-bold mt-1 text-[var(--accent-success)]">
            {completedCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Overall Roll-Up
          </span>
          <div className="text-xl font-bold mt-1 text-[var(--accent-primary)] font-mono">
            {overallProgress}%
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Active Timeframe
            </span>
            <div className="text-sm font-bold mt-1 capitalize">
              {selectedHorizon === 'all' ? '8 Cascades' : selectedHorizon}
            </div>
          </div>
          <button
            onClick={() => onOpenQuickAdd({ horizon: selectedHorizon === 'all' ? 'yearly' : selectedHorizon })}
            className="p-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white shadow-sm transition-colors"
            title="Create Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizon Tabs Switcher */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedHorizon('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedHorizon === 'all'
              ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
          }`}
        >
          All 8 Horizons
        </button>

        {HORIZONS.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHorizon(h.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              selectedHorizon === h.id
                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
            }`}
          >
            <span className="font-mono text-[10px] opacity-75">[{h.shortLabel}]</span>
            <span>{h.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2 flex-1 min-w-[220px] bg-[var(--bg-main)] px-3 py-1.5 rounded-lg border border-[var(--border-color)]">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals, tags (#systems), or notes..."
            className="w-full bg-transparent text-xs text-[var(--text-main)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none text-[var(--text-muted)]"
          >
            <option value="all">Status: All</option>
            <option value="todo">Status: Pending</option>
            <option value="completed">Status: Completed</option>
          </select>

          <button
            onClick={() =>
              onOpenQuickAdd({
                horizon: selectedHorizon === 'all' ? 'yearly' : selectedHorizon,
              })
            }
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Cascading Goal Tree List */}
      <div className="space-y-3">
        {rootGoals.length > 0 ? (
          rootGoals.map((g) => (
            <GoalNode
              key={g.id}
              goal={g}
              allGoals={goals}
              onToggleGoal={onToggleGoal}
              onSelectGoal={onSelectGoal}
              onBreakDown={onBreakDown}
            />
          ))
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-[var(--border-color)] text-center bg-[var(--bg-surface)]">
            <Layers className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold mb-1">No goals found for this view</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Create your first cascading goal or clear active search filters.
            </p>
            <button
              onClick={() => onOpenQuickAdd({ horizon: selectedHorizon === 'all' ? 'yearly' : selectedHorizon })}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Goal Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
