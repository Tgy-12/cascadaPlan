import React, { useState } from 'react';
import { PlanGoal, TimeHorizon } from '../types';
import { PomodoroTimer } from './PomodoroTimer';
import {
  calculateEndTime,
  formatDuration,
  isSlotCoveredByTask,
  DURATION_PRESETS,
} from '../utils/dateUtils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Flame,
  Bell,
  BellOff,
  Zap,
} from 'lucide-react';

interface DailyPlannerProps {
  goals: PlanGoal[];
  onToggleGoal: (goalId: string) => void;
  onOpenQuickAdd: (opts: {
    horizon?: TimeHorizon;
    parentId?: string | null;
    date?: string;
    timeSlot?: string;
    durationMinutes?: number;
  }) => void;
  onAddGoal?: (goal: Omit<PlanGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSelectGoal: (goal: PlanGoal) => void;
  selectedDate: string;
  onChangeDate: (newDate: string) => void;
  onPomodoroCompleted: (goalId: string) => void;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({
  goals,
  onToggleGoal,
  onOpenQuickAdd,
  onAddGoal,
  onSelectGoal,
  selectedDate,
  onChangeDate,
  onPomodoroCompleted,
}) => {
  const [activeFocusGoalId, setActiveFocusGoalId] = useState<string | null>(null);

  // Quick Action Block inline state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStartHour, setQuickStartHour] = useState('09:00');
  const [quickDuration, setQuickDuration] = useState(60); // 1 hour default
  const [quickAlarm, setQuickAlarm] = useState(true);

  const hoursList = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  const currentHourString = `${new Date().getHours().toString().padStart(2, '0')}:00`;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Daily goals for this date
  const dailyGoals = goals.filter(
    (g) => g.horizon === 'daily' && (!g.date || g.date === selectedDate)
  );

  // Hourly goals for this date
  const hourlyGoals = goals.filter(
    (g) => g.horizon === 'hourly' && (!g.date || g.date === selectedDate)
  );

  // Unscheduled hourly tasks
  const unscheduledTasks = hourlyGoals.filter((g) => !g.timeSlot);

  // Active focus goal for Pomodoro
  const activeFocusGoal = goals.find((g) => g.id === activeFocusGoalId) || null;

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onChangeDate(d.toISOString().split('T')[0]);
  };

  const setDateToToday = () => {
    onChangeDate(new Date().toISOString().split('T')[0]);
  };

  const completedHourlyCount = hourlyGoals.filter((g) => g.status === 'completed').length;
  const totalHourlyCount = hourlyGoals.length;
  const dayProgress =
    totalHourlyCount > 0 ? Math.round((completedHourlyCount / totalHourlyCount) * 100) : 0;

  // Handle instant inline plan creation
  const handleQuickAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !onAddGoal) return;

    const endTime = calculateEndTime(quickStartHour, quickDuration);

    onAddGoal({
      title: quickTitle.trim(),
      horizon: 'hourly',
      parentId: null, // Standalone 8-horizon optional!
      description: '',
      status: 'todo',
      progress: 0,
      date: selectedDate,
      timeSlot: quickStartHour,
      endTime,
      durationMinutes: quickDuration,
      alarmEnabled: quickAlarm,
      alarmTriggered: false,
      pomodoroCount: 0,
      tags: ['#daily'],
      order: Date.now(),
    });

    setQuickTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>Daily Action Timeline & Range Planner</span>
              {isToday && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--accent-success)]/15 text-[var(--accent-success)] border border-[var(--accent-success)]/30 font-semibold">
                  TODAY
                </span>
              )}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Schedule focused time ranges (e.g. 2h CNS, 40m PicoCTF, 4h Coding) with alarms
            </p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onChangeDate(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          {!isToday && (
            <button
              onClick={setDateToToday}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color)] text-[var(--accent-primary)] transition-colors"
            >
              Today
            </button>
          )}

          <button
            onClick={() => shiftDate(1)}
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instant Action Block Creator */}
      {onAddGoal && (
        <form
          onSubmit={handleQuickAddBlock}
          className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Plan a Time Block (8 Horizons Optional)
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Scheduled: <strong>{quickStartHour}</strong> →{' '}
              <strong>{calculateEndTime(quickStartHour, quickDuration)}</strong> (
              {formatDuration(quickDuration)})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Title Input */}
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="e.g. Study class materials (CNS), LeetCode, Coding..."
              className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
            />

            {/* Start Slot */}
            <select
              value={quickStartHour}
              onChange={(e) => setQuickStartHour(e.target.value)}
              className="px-2.5 py-2 text-xs font-mono rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none"
            >
              {hoursList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            {/* Duration Presets */}
            <div className="flex items-center gap-1">
              {[
                { l: '25m', m: 25 },
                { l: '40m', m: 40 },
                { l: '1h', m: 60 },
                { l: '2h', m: 120 },
                { l: '4h', m: 240 },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.m}
                  onClick={() => setQuickDuration(preset.m)}
                  className={`px-2 py-1.5 text-[11px] font-mono rounded border transition-all ${
                    quickDuration === preset.m
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold shadow-sm'
                      : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {preset.l}
                </button>
              ))}
            </div>

            {/* Alarm Toggle */}
            <button
              type="button"
              onClick={() => setQuickAlarm(!quickAlarm)}
              className={`p-2 rounded-lg border transition-colors ${
                quickAlarm
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-muted)]'
              }`}
              title={quickAlarm ? 'Alarm enabled' : 'Alarm muted'}
            >
              {quickAlarm ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            {/* Add Button */}
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Timeline + Pomodoro & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 06:00 - 23:00 Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs">
            <span className="font-semibold text-[var(--text-muted)]">
              Daily Timeline (06:00 – 23:00)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--text-muted)]">
                {completedHourlyCount} of {totalHourlyCount} Completed ({dayProgress}%)
              </span>
              <div className="w-24 h-2 rounded-full bg-[var(--bg-main)] overflow-hidden border border-[var(--border-color)]">
                <div
                  className="h-full bg-[var(--accent-primary)] transition-all"
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hourly Slots */}
          <div className="space-y-2">
            {hoursList.map((hour) => {
              // Tasks starting at this hour
              const startingTasks = hourlyGoals.filter((g) => g.timeSlot === hour);

              // Tasks continuing through this hour from an earlier slot
              const continuingTasks = hourlyGoals.filter((g) => {
                const { isOngoing } = isSlotCoveredByTask(
                  hour,
                  g.timeSlot || '',
                  g.durationMinutes || 60
                );
                return isOngoing;
              });

              const isCurrentHour = isToday && hour === currentHourString;

              return (
                <div
                  key={hour}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isCurrentHour
                      ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-md ring-1 ring-[var(--accent-primary)]/40'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--border-focus)]/50'
                  }`}
                >
                  {/* Time label */}
                  <div className="w-14 flex-shrink-0 text-center pt-1">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isCurrentHour ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {hour}
                    </span>
                    {isCurrentHour && (
                      <span className="block text-[9px] uppercase font-bold text-[var(--accent-primary)] mt-0.5 animate-pulse">
                        ● NOW
                      </span>
                    )}
                  </div>

                  {/* Tasks in this hour */}
                  <div className="flex-1 space-y-2 min-h-[36px]">
                    {/* Continuing Tasks from earlier slots */}
                    {continuingTasks.map((ct) => (
                      <div
                        key={`cont-${ct.id}-${hour}`}
                        onClick={() => onSelectGoal(ct)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-main)]/60 text-[11px] text-[var(--text-muted)] cursor-pointer hover:border-[var(--accent-primary)]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[var(--accent-primary)] font-bold">↳</span>
                          <span className="truncate">
                            Ongoing: <strong>{ct.title}</strong>
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          until {ct.endTime || calculateEndTime(ct.timeSlot || '00:00', ct.durationMinutes || 60)}
                        </span>
                      </div>
                    ))}

                    {/* Tasks Starting at this Hour */}
                    {startingTasks.length > 0 ? (
                      startingTasks.map((task) => {
                        const isCompleted = task.status === 'completed';
                        const isFocused = activeFocusGoalId === task.id;
                        const duration = task.durationMinutes || 60;
                        const endTime =
                          task.endTime || calculateEndTime(task.timeSlot || hour, duration);

                        return (
                          <div
                            key={task.id}
                            className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                              isFocused
                                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => onToggleGoal(task.id)}
                                className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--accent-success)] transition-colors"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)]" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>

                              <div className="truncate flex-1">
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    onClick={() => onSelectGoal(task)}
                                    className={`text-xs font-semibold cursor-pointer truncate hover:underline ${
                                      isCompleted
                                        ? 'line-through text-[var(--text-muted)]'
                                        : 'text-[var(--text-main)]'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {/* Range badge */}
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[var(--bg-main)] text-[var(--accent-primary)] border border-[var(--border-color)] flex-shrink-0">
                                    {task.timeSlot} - {endTime} ({formatDuration(duration)})
                                  </span>

                                  {/* Alarm indicator */}
                                  {task.alarmEnabled && (
                                    <span
                                      className="text-amber-400 text-[10px]"
                                      title="Alarm set for start time"
                                    >
                                      🔔
                                    </span>
                                  )}
                                </div>
                              </div>

                              {task.pomodoroCount ? (
                                <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono">
                                  🍅 {task.pomodoroCount}
                                </span>
                              ) : null}
                            </div>

                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 flex-shrink-0">
                              <button
                                onClick={() => setActiveFocusGoalId(isFocused ? null : task.id)}
                                className={`px-2 py-1 text-[10px] font-medium rounded transition-colors flex items-center gap-1 ${
                                  isFocused
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--bg-main)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-muted)]'
                                }`}
                                title="Set as Pomodoro Target"
                              >
                                <Flame className="w-3 h-3" />
                                <span>{isFocused ? 'Focused' : 'Focus'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : continuingTasks.length === 0 ? (
                      <button
                        onClick={() =>
                          onOpenQuickAdd({
                            horizon: 'hourly',
                            date: selectedDate,
                            timeSlot: hour,
                            durationMinutes: 60,
                          })
                        }
                        className="w-full py-1.5 text-left text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] rounded border border-dashed border-transparent hover:border-[var(--border-color)] hover:bg-[var(--bg-main)] px-2 transition-all flex items-center gap-1.5 opacity-60 hover:opacity-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Schedule task starting at {hour}...</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Pomodoro Focus Timer & Daily Priorities */}
        <div className="space-y-6">
          {/* Pomodoro Focus Timer Component */}
          <PomodoroTimer
            activeGoal={activeFocusGoal}
            onPomodoroCompleted={onPomodoroCompleted}
          />

          {/* Daily Priorities Card */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-warning)]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Daily Goals ({dailyGoals.length})
                </h3>
              </div>
              <button
                onClick={() =>
                  onOpenQuickAdd({
                    horizon: 'daily',
                    date: selectedDate,
                  })
                }
                className="text-[11px] text-[var(--accent-primary)] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Daily
              </button>
            </div>

            {dailyGoals.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-2">
                No high-level daily goals created for this date yet.
              </p>
            ) : (
              <div className="space-y-2">
                {dailyGoals.map((dg) => {
                  const isDone = dg.status === 'completed';
                  return (
                    <div
                      key={dg.id}
                      className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <button
                            onClick={() => onToggleGoal(dg.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--accent-success)]"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[var(--accent-success)]" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            onClick={() => onSelectGoal(dg)}
                            className={`font-semibold cursor-pointer truncate ${
                              isDone ? 'line-through text-[var(--text-muted)]' : ''
                            }`}
                          >
                            {dg.title}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--accent-primary)]">
                          {dg.progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1 bg-[var(--bg-main)] rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-primary)] transition-all"
                          style={{ width: `${dg.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unscheduled Hourly Tasks Card */}
          {unscheduledTasks.length > 0 && (
            <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-[var(--text-muted)]">
                Unscheduled Action Items ({unscheduledTasks.length})
              </h3>
              <div className="space-y-1.5">
                {unscheduledTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-xs"
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    <button
                      onClick={() => onSelectGoal(t)}
                      className="text-[10px] text-[var(--accent-primary)] hover:underline flex items-center gap-1"
                    >
                      Schedule <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
