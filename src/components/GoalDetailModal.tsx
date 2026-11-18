import React, { useState } from 'react';
import { PlanGoal, HORIZONS, TaskStatus } from '../types';
import { formatMarkdownToHTML } from '../utils/markdown';
import { getNextHorizon, getBreadcrumbChain } from '../utils/cascade';
import { calculateEndTime, formatDuration, DURATION_PRESETS } from '../utils/dateUtils';
import {
  X,
  Trash2,
  GitFork,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Edit3,
  Eye,
  Save,
  Tag,
  Bell,
  BellOff,
  Timer,
} from 'lucide-react';

interface GoalDetailModalProps {
  goal: PlanGoal | null;
  allGoals: PlanGoal[];
  onClose: () => void;
  onUpdateGoal: (updated: PlanGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onBreakDown: (parentGoal: PlanGoal) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  allGoals,
  onClose,
  onUpdateGoal,
  onDeleteGoal,
  onBreakDown,
}) => {
  if (!goal) return null;

  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [status, setStatus] = useState<TaskStatus>(goal.status);
  const [progress, setProgress] = useState<number>(goal.progress);
  const [date, setDate] = useState<string>(goal.date || '');
  const [timeSlot, setTimeSlot] = useState<string>(goal.timeSlot || '09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(goal.durationMinutes || 60);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(goal.alarmEnabled ?? true);
  const [tags, setTags] = useState(goal.tags.join(' '));
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  const horizonMeta = HORIZONS.find((h) => h.id === goal.horizon);
  const nextHorizon = getNextHorizon(goal.horizon);
  const nextHorizonMeta = nextHorizon ? HORIZONS.find((h) => h.id === nextHorizon) : null;
  const breadcrumbs = getBreadcrumbChain(goal.id, allGoals);

  const directChildren = allGoals.filter((g) => g.parentId === goal.id);
  const hasChildren = directChildren.length > 0;

  const calculatedEnd = calculateEndTime(timeSlot, durationMinutes);

  const handleSave = () => {
    const updatedTags = tags
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onUpdateGoal({
      ...goal,
      title: title.trim() || goal.title,
      description,
      status,
      progress: hasChildren ? goal.progress : progress,
      date: date || undefined,
      timeSlot: goal.horizon === 'hourly' ? timeSlot : goal.timeSlot,
      endTime: goal.horizon === 'hourly' ? calculatedEnd : goal.endTime,
      durationMinutes: goal.horizon === 'hourly' ? durationMinutes : goal.durationMinutes,
      alarmEnabled: goal.horizon === 'hourly' ? alarmEnabled : goal.alarmEnabled,
      tags: updatedTags,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    const childCount = allGoals.filter((g) => g.parentId === goal.id).length;
    const msg =
      childCount > 0
        ? `Warning: Deleting this will also delete its ${childCount} cascading sub-items! Continue?`
        : 'Are you sure you want to delete this task?';

    if (confirm(msg)) {
      onDeleteGoal(goal.id);
      onClose();
    }
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 shadow-2xl transition-all max-h-[92vh] flex flex-col"
        style={{ color: 'var(--text-main)' }}
      >
        {/* Top Meta & Breadcrumbs */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 overflow-x-auto text-xs text-[var(--text-muted)]">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                horizonMeta?.badgeClass || 'badge-yearly'
              }`}
            >
              {horizonMeta?.label.toUpperCase()}
            </span>

            {breadcrumbs.length > 0 && (
              <span className="flex items-center gap-1">
                {breadcrumbs.map((b) => (
                  <span key={b.id} className="flex items-center gap-1">
                    <span>/</span>
                    <span className="truncate max-w-[120px]">{b.title}</span>
                  </span>
                ))}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title Editor */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)]">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-base font-bold rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          {/* Time & Duration Range (for hourly tasks) */}
          {(goal.horizon === 'hourly' || goal.timeSlot) && (
            <div className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Scheduled Time Range & Duration
                </span>
                <span className="font-mono text-xs text-[var(--accent-primary)] font-bold">
                  {timeSlot} → {calculatedEnd} ({formatDuration(durationMinutes)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1 text-[var(--text-muted)]">
                    Start Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]"
                  >
                    {timeSlots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium mb-1 text-[var(--text-muted)]">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {DURATION_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.minutes}
                    onClick={() => setDurationMinutes(p.minutes)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-all ${
                      durationMinutes === p.minutes
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold'
                        : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="15"
                  max="480"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="flex-1 accent-[var(--accent-primary)]"
                />
                <span className="font-mono text-xs w-12 text-right">
                  {formatDuration(durationMinutes)}
                </span>
              </div>

              {/* Alarm Checkbox */}
              <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={alarmEnabled}
                    onChange={(e) => setAlarmEnabled(e.target.checked)}
                    className="rounded accent-[var(--accent-primary)]"
                  />
                  <span className="flex items-center gap-1.5 font-medium">
                    {alarmEnabled ? (
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                    <span>Sound Alarm when {timeSlot} is reached</span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Status & Progress Bar */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[var(--text-muted)]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as TaskStatus;
                  setStatus(s);
                  if (s === 'completed') setProgress(100);
                  if (s === 'todo') setProgress(0);
                }}
                className="w-full px-3 py-1.5 text-xs rounded bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none capitalize"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-[var(--text-muted)]">
                  {hasChildren ? 'Roll-up Progress (from children)' : 'Progress'}
                </span>
                <span className="font-mono text-[var(--accent-primary)]">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                disabled={hasChildren}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (val === 100) setStatus('completed');
                  else if (val === 0) setStatus('todo');
                  else setStatus('in_progress');
                }}
                className="w-full accent-[var(--accent-primary)] cursor-pointer disabled:opacity-50"
              />
              {hasChildren && (
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  ⚡ Auto-calculated from {directChildren.length} sub-goals
                </p>
              )}
            </div>
          </div>

          {/* Sub-goals list if any */}
          {hasChildren && (
            <div className="p-3.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center justify-between">
                <span>Linked Sub-Goals ({directChildren.length})</span>
                <span className="text-[11px] font-mono">
                  {directChildren.filter((c) => c.status === 'completed').length} / {directChildren.length} Done
                </span>
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {directChildren.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded bg-[var(--bg-main)] text-xs border border-[var(--border-color)]"
                  >
                    <span className="truncate pr-2">{c.title}</span>
                    <span className="font-mono text-[var(--accent-primary)] text-[11px]">
                      {c.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Markdown Notes Editor / Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Markdown Notes, Checklists & Links
              </label>
              <div className="flex gap-1 border border-[var(--border-color)] rounded-lg p-0.5 bg-[var(--bg-main)]">
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(false)}
                  className={`px-2 py-0.5 text-[11px] rounded ${
                    !previewMarkdown ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(true)}
                  className={`px-2 py-0.5 text-[11px] rounded flex items-center gap-1 ${
                    previewMarkdown ? 'bg-[var(--accent-primary)] text-white' : 'text-[var(--text-muted)]'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              </div>
            </div>

            {previewMarkdown ? (
              <div
                className="p-3.5 min-h-[120px] rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs leading-relaxed overflow-y-auto max-h-48"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdownToHTML(description || '*No notes added yet.*'),
                }}
              />
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Write Markdown, `- [ ]` checklists, ```code snippets, or external research links..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#study #cns #dev"
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none text-[var(--text-main)]"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs flex items-center gap-1.5 transition-colors"
            title="Delete this task"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            {nextHorizonMeta && (
              <button
                type="button"
                onClick={() => {
                  onBreakDown(goal);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--accent-primary)]/40 hover:bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>+ Break Down into {nextHorizonMeta.label}</span>
              </button>
            )}

            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
