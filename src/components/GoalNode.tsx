import React, { useState } from 'react';
import { PlanGoal, HORIZONS, TimeHorizon } from '../types';
import { getNextHorizon } from '../utils/cascade';
import {
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  GitFork,
  MoreVertical,
  Plus,
  Tag,
  Clock,
} from 'lucide-react';

interface GoalNodeProps {
  goal: PlanGoal;
  allGoals: PlanGoal[];
  onToggleGoal: (id: string) => void;
  onSelectGoal: (goal: PlanGoal) => void;
  onBreakDown: (parentGoal: PlanGoal) => void;
  depth?: number;
}

export const GoalNode: React.FC<GoalNodeProps> = ({
  goal,
  allGoals,
  onToggleGoal,
  onSelectGoal,
  onBreakDown,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Direct children of this goal
  const children = allGoals.filter((g) => g.parentId === goal.id);
  const hasChildren = children.length > 0;

  const horizonMeta = HORIZONS.find((h) => h.id === goal.horizon);
  const nextHorizon = getNextHorizon(goal.horizon);
  const nextHorizonMeta = nextHorizon ? HORIZONS.find((h) => h.id === nextHorizon) : null;

  const isCompleted = goal.status === 'completed';

  return (
    <div className="space-y-2">
      {/* Goal Card Container */}
      <div
        className={`group rounded-xl border transition-all ${
          isCompleted
            ? 'border-[var(--border-color)] bg-[var(--bg-surface)]/60 opacity-80'
            : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--border-focus)]/50 shadow-sm'
        }`}
        style={{ marginLeft: `${Math.min(depth * 16, 80)}px` }}
      >
        <div className="p-3.5 flex items-start justify-between gap-3">
          {/* Left section: expand arrow + checkbox + title/meta */}
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {/* Expand / Collapse toggle */}
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mt-0.5"
                title={isExpanded ? 'Collapse sub-goals' : 'Expand sub-goals'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6" /> // spacer to align with nodes that have expand chevron
            )}

            {/* Checkbox */}
            <button
              onClick={() => onToggleGoal(goal.id)}
              className="mt-0.5 text-[var(--text-muted)] hover:text-[var(--accent-success)] transition-colors flex-shrink-0"
              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--accent-success)]" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>

            {/* Title, Badge & Sub-meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    horizonMeta?.badgeClass || 'badge-yearly'
                  }`}
                >
                  {horizonMeta?.shortLabel} {horizonMeta?.label}
                </span>

                <span
                  onClick={() => onSelectGoal(goal)}
                  className={`text-sm font-semibold cursor-pointer truncate hover:underline ${
                    isCompleted
                      ? 'line-through text-[var(--text-muted)]'
                      : 'text-[var(--text-main)]'
                  }`}
                >
                  {goal.title}
                </span>
              </div>

              {/* Progress bar & child count */}
              <div className="flex items-center gap-3 mt-1.5 max-w-sm">
                <div className="flex-1 h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? 'bg-[var(--accent-success)]' : 'bg-[var(--accent-primary)]'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-[var(--text-muted)] flex-shrink-0">
                  {goal.progress}%
                </span>
                {hasChildren && (
                  <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0">
                    ({children.filter((c) => c.status === 'completed').length}/{children.length} sub-goals)
                  </span>
                )}
              </div>

              {/* Tags & Time slot */}
              {(goal.tags.length > 0 || goal.timeSlot) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {goal.timeSlot && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {goal.timeSlot}
                    </span>
                  )}
                  {goal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-main)] text-[var(--accent-primary)] border border-[var(--border-color)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right section: Action Buttons */}
          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 flex-shrink-0">
            {nextHorizonMeta && (
              <button
                onClick={() => onBreakDown(goal)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--bg-main)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-muted)] border border-[var(--border-color)] transition-all flex items-center gap-1.5"
                title={`Break down into ${nextHorizonMeta.label}`}
              >
                <GitFork className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:text-white" />
                <span className="hidden sm:inline">+ Break Down</span>
              </button>
            )}

            <button
              onClick={() => onSelectGoal(goal)}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
              title="Edit Task Details & Notes"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Nested Children if Expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-2 border-l border-[var(--border-color)] ml-4 pl-2">
          {children.map((child) => (
            <GoalNode
              key={child.id}
              goal={child}
              allGoals={allGoals}
              onToggleGoal={onToggleGoal}
              onSelectGoal={onSelectGoal}
              onBreakDown={onBreakDown}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
