import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { playWorkCompleteChime, playBreakCompleteChime } from '../utils/audio';
import { PlanGoal } from '../types';

interface PomodoroTimerProps {
  activeGoal?: PlanGoal | null;
  onPomodoroCompleted?: (goalId: string) => void;
  compact?: boolean;
}

type PomodoroMode = 'work' | 'short_break' | 'long_break';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  activeGoal,
  onPomodoroCompleted,
  compact = false,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [workMinutes, setWorkMinutes] = useState<number>(25); // Default 25 min, fully adjustable
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const timerRef = useRef<number | null>(null);

  const getDurationSeconds = (m: PomodoroMode): number => {
    switch (m) {
      case 'work':
        return workMinutes * 60;
      case 'short_break':
        return breakMinutes * 60;
      case 'long_break':
        return 15 * 60;
    }
  };

  // Adjust time by delta minutes (+1, -1, +5, -5)
  const adjustMinutes = (delta: number) => {
    if (mode === 'work') {
      const nextMin = Math.max(1, workMinutes + delta);
      setWorkMinutes(nextMin);
      if (!isRunning) {
        setTimeLeft(nextMin * 60);
      } else {
        // Adjust currently running timer
        setTimeLeft((prev) => Math.max(5, prev + delta * 60));
      }
    } else {
      const nextMin = Math.max(1, breakMinutes + delta);
      setBreakMinutes(nextMin);
      if (!isRunning) {
        setTimeLeft(nextMin * 60);
      } else {
        setTimeLeft((prev) => Math.max(5, prev + delta * 60));
      }
    }
  };

  // Switch modes
  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') setTimeLeft(workMinutes * 60);
    else if (newMode === 'short_break') setTimeLeft(breakMinutes * 60);
    else setTimeLeft(15 * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled, activeGoal, workMinutes, breakMinutes]);

  const handleSessionEnd = () => {
    setIsRunning(false);

    if (mode === 'work') {
      if (soundEnabled) playWorkCompleteChime();
      setCompletedSessions((prev) => prev + 1);

      // Trigger task pomodoro increment
      if (activeGoal && onPomodoroCompleted) {
        onPomodoroCompleted(activeGoal.id);
      }

      // Browser notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('🍅 Pomodoro Finished!', {
          body: activeGoal
            ? `Great focus on: "${activeGoal.title}"! Take a break.`
            : 'Work session complete! Take a break.',
          icon: '/icons/icon-128.png',
        });
      }

      // Next is break
      const nextMode = (completedSessions + 1) % 4 === 0 ? 'long_break' : 'short_break';
      setMode(nextMode);
      setTimeLeft(nextMode === 'long_break' ? 15 * 60 : breakMinutes * 60);
    } else {
      if (soundEnabled) playBreakCompleteChime();

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('⚡ Break Finished!', {
          body: 'Ready to dive back into deep work?',
          icon: '/icons/icon-128.png',
        });
      }

      setMode('work');
      setTimeLeft(workMinutes * 60);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationSeconds(mode));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDuration = getDurationSeconds(mode);
  const progressPercent = Math.min(
    100,
    Math.round(((currentDuration - timeLeft) / currentDuration) * 100)
  );

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs">
        {/* Minus */}
        <button
          onClick={() => adjustMinutes(-1)}
          className="p-0.5 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          title="Decrease 1 min"
        >
          <Minus className="w-3 h-3" />
        </button>

        <span className="font-mono font-bold text-sm text-[var(--accent-primary)] px-0.5">
          {formatTime(timeLeft)}
        </span>

        {/* Plus */}
        <button
          onClick={() => adjustMinutes(1)}
          className="p-0.5 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          title="Increase 1 min"
        >
          <Plus className="w-3 h-3" />
        </button>

        <button
          onClick={toggleTimer}
          className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] ml-1"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-1 rounded hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-[var(--text-muted)] border-l border-[var(--border-color)] pl-1.5">
          🍅 {completedSessions}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-md">
      {/* Mode selectors */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
          <button
            onClick={() => switchMode('work')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'work'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Work ({workMinutes}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'short_break'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Break ({breakMinutes}m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              mode === 'long_break'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Long (15m)
          </button>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border border-[var(--border-color)] transition-colors ${
            soundEnabled ? 'text-[var(--accent-primary)] bg-[var(--bg-main)]' : 'text-[var(--text-muted)]'
          }`}
          title={soundEnabled ? 'Sound alerts enabled' : 'Sound muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Countdown with (+, -) Controls */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="flex items-center justify-center gap-4">
          {/* Minus Button */}
          <button
            onClick={() => adjustMinutes(-5)}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors active:scale-95"
            title="Decrease 5 minutes (-5m)"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Time display */}
          <div className="text-center">
            <div className="font-mono text-5xl font-extrabold tracking-wider" style={{ color: 'var(--text-main)' }}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
              target: {mode === 'work' ? workMinutes : breakMinutes} mins
            </div>
          </div>

          {/* Plus Button */}
          <button
            onClick={() => adjustMinutes(5)}
            className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors active:scale-95"
            title="Increase 5 minutes (+5m)"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Duration Preset Pills */}
        <div className="flex items-center gap-1.5 mt-3">
          {[15, 25, 45, 60, 90].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setWorkMinutes(preset);
                if (mode === 'work') {
                  setTimeLeft(preset * 60);
                  setIsRunning(false);
                }
              }}
              className={`px-2 py-0.5 text-[11px] rounded font-mono border transition-all ${
                workMinutes === preset && mode === 'work'
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                  : 'border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {preset}m
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-1.5 bg-[var(--bg-main)] rounded-full mt-4 overflow-hidden border border-[var(--border-color)]">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'work'
                ? 'bg-[var(--accent-primary)]'
                : mode === 'short_break'
                ? 'bg-emerald-500'
                : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active Target Task info */}
        {activeGoal ? (
          <div className="mt-3 text-xs text-[var(--text-muted)] flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--bg-main)] border border-[var(--border-color)] max-w-sm truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-primary)] flex-shrink-0" />
            <span className="truncate">Focusing on: <strong>{activeGoal.title}</strong></span>
          </div>
        ) : (
          <div className="mt-3 text-[11px] text-[var(--text-muted)] italic">
            Tip: Click a task in the timeline to link Pomodoros to it
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleSessionEnd()}
          className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Skip session"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Completed session count */}
      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Completed Pomodoros: <strong>{completedSessions}</strong> 🍅</span>
        <span className="text-[11px] text-[var(--text-muted)]">Adjust work time with +/- icons</span>
      </div>
    </div>
  );
};
