import React, { useState, useEffect, useRef } from 'react';
import { PlanGoal, TimeHorizon, HORIZONS } from '../types';
import { getParentHorizon } from '../utils/cascade';
import { calculateEndTime, formatDuration, DURATION_PRESETS } from '../utils/dateUtils';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag,
  FileText,
  Layers,
  Bell,
  BellOff,
  Timer,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<PlanGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  allGoals: PlanGoal[];
  defaultHorizon?: TimeHorizon;
  defaultParentId?: string | null;
  defaultDate?: string;
  defaultTimeSlot?: string;
  defaultDurationMinutes?: number;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
  allGoals,
  defaultHorizon = 'daily',
  defaultParentId = null,
  defaultDate,
  defaultTimeSlot,
  defaultDurationMinutes = 60,
}) => {
  const [title, setTitle] = useState('');
  const [horizon, setHorizon] = useState<TimeHorizon>(defaultHorizon);
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [date, setDate] = useState<string>(
    defaultDate || new Date().toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>(defaultTimeSlot || '09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(defaultDurationMinutes);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync defaults when opened
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setHorizon(defaultHorizon);
      setParentId(defaultParentId);
      if (defaultDate) setDate(defaultDate);
      if (defaultTimeSlot) setTimeSlot(defaultTimeSlot);
      setDurationMinutes(defaultDurationMinutes || 60);
      setAlarmEnabled(true);
      setDescription('');
      setTagsInput('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultHorizon, defaultParentId, defaultDate, defaultTimeSlot, defaultDurationMinutes]);

  if (!isOpen) return null;

  const parentHorizonType = getParentHorizon(horizon);
  const eligibleParents = allGoals.filter(
    (g) => !parentHorizonType || g.horizon === parentHorizonType
  );

  const endTime = calculateEndTime(timeSlot, durationMinutes);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onAddGoal({
      title: title.trim(),
      horizon,
      parentId: parentId || null,
      description: description.trim(),
      status: 'todo',
      progress: 0,
      date: horizon === 'daily' || horizon === 'hourly' ? date : undefined,
      timeSlot: horizon === 'hourly' ? timeSlot : undefined,
      endTime: horizon === 'hourly' ? endTime : undefined,
      durationMinutes: horizon === 'hourly' ? durationMinutes : undefined,
      alarmEnabled: horizon === 'hourly' ? alarmEnabled : false,
      alarmTriggered: false,
      pomodoroCount: 0,
      tags,
      order: Date.now(),
    });

    onClose();
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-5 shadow-2xl transition-all max-h-[92vh] overflow-y-auto"
        style={{ color: 'var(--text-main)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold text-xs">
              Ctrl+K
            </span>
            <h2 className="text-base font-bold">Quick Add Task or Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)]">
              Task or Goal Title *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study class materials (CNS), Meeting, Coding (4h)..."
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Horizon Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Time Horizon
              </label>
              <span className="text-[10px] text-[var(--text-muted)] italic">
                (Optional — standalone daily tasks are supported)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {HORIZONS.map((h) => (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => {
                    setHorizon(h.id);
                    if (h.id === 'yearly') setParentId(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    horizon === h.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                  }`}
                >
                  <div className="font-bold text-[10px]">{h.shortLabel}</div>
                  <div className="truncate text-[11px]">{h.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Parent Goal link */}
          {horizon !== 'yearly' && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)]">
                Link to Parent Goal (Optional)
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none transition-colors"
              >
                <option value="">-- Standalone (No Parent Link) --</option>
                {eligibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.horizon.toUpperCase()}] {p.title} ({p.progress}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Daily & Hourly Schedule Controls */}
          {(horizon === 'daily' || horizon === 'hourly') && (
            <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1 text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Target Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none text-[var(--text-main)]"
                  />
                </div>

                {horizon === 'hourly' && (
                  <div>
                    <label className="block text-[11px] font-medium mb-1 text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Start Time (06-23)
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none text-[var(--text-main)] font-mono"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Time Range & Duration Selector (for hourly) */}
              {horizon === 'hourly' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Duration & Time Range:
                    </label>
                    <span className="font-mono text-xs text-[var(--accent-primary)] font-bold">
                      {timeSlot} → {endTime} ({formatDuration(durationMinutes)})
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {DURATION_PRESETS.map((p) => (
                      <button
                        type="button"
                        key={p.minutes}
                        onClick={() => setDurationMinutes(p.minutes)}
                        className={`px-2 py-1 text-[11px] rounded font-mono border transition-all ${
                          durationMinutes === p.minutes
                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom duration slider / input */}
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

                  {/* Alarm reminder checkbox */}
                  <div className="pt-2 mt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={alarmEnabled}
                        onChange={(e) => setAlarmEnabled(e.target.checked)}
                        className="rounded accent-[var(--accent-primary)]"
                      />
                      <span className="flex items-center gap-1.5 font-medium">
                        {alarmEnabled ? (
                          <Bell className="w-3.5 h-3.5 text-[var(--accent-warning)]" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        )}
                        <span>Sound Alarm when {timeSlot} is reached</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Markdown Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Markdown Notes & Snippets (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Checklists - [ ], links, notes..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:border-[var(--accent-primary)] focus:outline-none font-mono transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags (Quick tags: #study, #coding, #meeting, #break, #picoctf)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#study, #cns, #coding"
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] focus:outline-none text-[var(--text-main)]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border-color)]">Ctrl+Enter</kbd> to save
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-surface-hover)] hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
