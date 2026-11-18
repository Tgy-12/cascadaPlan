import React, { useState, useEffect, useCallback } from 'react';
import { PlanGoal, TimeHorizon, AppTheme, HORIZONS } from './types';
import {
  loadAllGoals,
  saveGoal,
  saveGoalsBatch,
  deleteGoalCascade,
  loadSettings,
  saveSettings,
} from './db';
import {
  recalculateAllRollups,
  toggleGoalStatus,
  getNextHorizon,
} from './utils/cascade';
import { playTaskAlarmSound } from './utils/audio';

import { Header } from './components/Header';
import { HorizonView } from './components/HorizonView';
import { DailyPlanner } from './components/DailyPlanner';
import { QuickAddModal } from './components/QuickAddModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { BackupModal } from './components/BackupModal';
import { SupportModal } from './components/SupportModal';
import { Bell, Flame, X } from 'lucide-react';

export const App: React.FC<{ isPopup?: boolean }> = ({ isPopup = false }) => {
  const [goals, setGoals] = useState<PlanGoal[]>([]);
  const [theme, setTheme] = useState<AppTheme>('ubuntu-dark');
  const [currentView, setCurrentView] = useState<'cascade' | 'daily'>('daily'); // Default to daily planner for fast action
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaults, setQuickAddDefaults] = useState<{
    horizon?: TimeHorizon;
    parentId?: string | null;
    date?: string;
    timeSlot?: string;
    durationMinutes?: number;
  }>({});

  const [selectedGoalForDetail, setSelectedGoalForDetail] = useState<PlanGoal | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Active Task Alarm state
  const [activeAlarm, setActiveAlarm] = useState<{
    goalId: string;
    title: string;
    timeSlot: string;
    endTime?: string;
  } | null>(null);

  // 1. Initialize data & settings
  const refreshData = useCallback(async () => {
    try {
      const [loadedGoals, loadedSettings] = await Promise.all([
        loadAllGoals(),
        loadSettings(),
      ]);

      const updatedGoals = recalculateAllRollups(loadedGoals);
      setGoals(updatedGoals);
      setTheme(loadedSettings.theme || 'ubuntu-dark');
      document.documentElement.setAttribute('data-theme', loadedSettings.theme || 'ubuntu-dark');
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Apply theme to DOM
  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    saveSettings({
      theme: newTheme,
      pomodoroWorkDuration: 25,
      pomodoroBreakDuration: 5,
      autoStartBreak: false,
      soundEnabled: true,
      notificationsEnabled: true,
      defaultView: currentView,
      isExtensionPopup: isPopup,
    });
  };

  // 2. Scheduled Task Alarm Polling Loop (Checks every 15s)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHH = now.getHours().toString().padStart(2, '0');
      const currentMM = now.getMinutes().toString().padStart(2, '0');
      const currentHHMM = `${currentHH}:${currentMM}`;

      for (const g of goals) {
        if (
          g.horizon === 'hourly' &&
          g.date === todayStr &&
          g.timeSlot &&
          g.timeSlot.startsWith(currentHHMM.slice(0, 4)) && // matches hour/min
          g.alarmEnabled !== false &&
          !g.alarmTriggered &&
          g.status !== 'completed'
        ) {
          playTaskAlarmSound();

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('🔔 Scheduled Plan Time!', {
              body: `Time to start: "${g.title}" (${g.timeSlot} - ${g.endTime || ''})`,
              icon: '/icons/icon-128.png',
            });
          }

          setActiveAlarm({
            goalId: g.id,
            title: g.title,
            timeSlot: g.timeSlot,
            endTime: g.endTime,
          });

          // Mark triggered so it doesn't repeat
          handleUpdateGoal({ ...g, alarmTriggered: true });
        }
      }
    };

    const interval = setInterval(checkAlarms, 15000);
    return () => clearInterval(interval);
  }, [goals]);

  // 3. Global Keyboard Shortcuts (Ctrl+K, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === 'k' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setQuickAddDefaults({
          horizon: currentView === 'daily' ? 'hourly' : 'daily',
          date: selectedDate,
        });
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, selectedDate]);

  // 4. Goal Handlers
  const handleToggleGoal = async (goalId: string) => {
    const updated = toggleGoalStatus(goalId, goals);
    setGoals(updated);
    await saveGoalsBatch(updated);
  };

  const handleAddGoal = async (
    newGoalData: Omit<PlanGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const id = 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const now = new Date().toISOString();
    const newGoal: PlanGoal = {
      ...newGoalData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const combined = [...goals, newGoal];
    const rolledUp = recalculateAllRollups(combined);
    setGoals(rolledUp);
    await saveGoalsBatch(rolledUp);
  };

  const handleUpdateGoal = async (updatedGoal: PlanGoal) => {
    const index = goals.findIndex((g) => g.id === updatedGoal.id);
    if (index === -1) return;

    const copy = [...goals];
    copy[index] = updatedGoal;
    const rolledUp = recalculateAllRollups(copy);
    setGoals(rolledUp);
    await saveGoalsBatch(rolledUp);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const deletedIds = await deleteGoalCascade(goalId);
    const remaining = goals.filter((g) => !deletedIds.includes(g.id));
    const rolledUp = recalculateAllRollups(remaining);
    setGoals(rolledUp);
  };

  const handleBreakDown = (parentGoal: PlanGoal) => {
    const nextH = getNextHorizon(parentGoal.horizon);
    if (!nextH) return;

    setQuickAddDefaults({
      horizon: nextH,
      parentId: parentGoal.id,
      date: selectedDate,
    });
    setIsQuickAddOpen(true);
  };

  const handlePomodoroCompleted = async (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (!target) return;

    const count = (target.pomodoroCount || 0) + 1;
    const updated: PlanGoal = {
      ...target,
      pomodoroCount: count,
      updatedAt: new Date().toISOString(),
    };
    await handleUpdateGoal(updated);
  };

  const openQuickAddWithOpts = (opts: {
    horizon?: TimeHorizon;
    parentId?: string | null;
    date?: string;
    timeSlot?: string;
    durationMinutes?: number;
  }) => {
    setQuickAddDefaults(opts);
    setIsQuickAddOpen(true);
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 ${isPopup ? 'p-2 w-[540px] max-w-full' : ''}`}>
      {/* Alarm Banner if triggered */}
      {activeAlarm && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between sticky top-0 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Bell className="w-4 h-4 animate-spin" />
            <span>
              Time for scheduled task: <strong>{activeAlarm.title}</strong> ({activeAlarm.timeSlot}
              {activeAlarm.endTime ? ` - ${activeAlarm.endTime}` : ''})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentView('daily');
                setActiveAlarm(null);
              }}
              className="px-2.5 py-1 rounded bg-white text-orange-700 text-xs font-bold hover:bg-orange-50 transition-colors flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Focus Now</span>
            </button>
            <button
              onClick={() => setActiveAlarm(null)}
              className="p-1 rounded hover:bg-black/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        currentView={currentView}
        onChangeView={setCurrentView}
        currentTheme={theme}
        onChangeTheme={handleThemeChange}
        onOpenQuickAdd={() =>
          openQuickAddWithOpts({
            horizon: currentView === 'daily' ? 'hourly' : 'daily',
            date: selectedDate,
          })
        }
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        isExtensionPopup={isPopup}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[var(--text-muted)] text-sm">
            Loading your offline plans...
          </div>
        ) : currentView === 'cascade' ? (
          <HorizonView
            goals={goals}
            onToggleGoal={handleToggleGoal}
            onSelectGoal={(g) => setSelectedGoalForDetail(g)}
            onBreakDown={handleBreakDown}
            onOpenQuickAdd={openQuickAddWithOpts}
          />
        ) : (
          <DailyPlanner
            goals={goals}
            onToggleGoal={handleToggleGoal}
            onOpenQuickAdd={openQuickAddWithOpts}
            onAddGoal={handleAddGoal}
            onSelectGoal={(g) => setSelectedGoalForDetail(g)}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onPomodoroCompleted={handlePomodoroCompleted}
          />
        )}
      </main>

      {/* Modals */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddGoal={handleAddGoal}
        allGoals={goals}
        defaultHorizon={quickAddDefaults.horizon}
        defaultParentId={quickAddDefaults.parentId}
        defaultDate={quickAddDefaults.date || selectedDate}
        defaultTimeSlot={quickAddDefaults.timeSlot}
        defaultDurationMinutes={quickAddDefaults.durationMinutes}
      />

      <GoalDetailModal
        goal={selectedGoalForDetail}
        allGoals={goals}
        onClose={() => setSelectedGoalForDetail(null)}
        onUpdateGoal={handleUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onBreakDown={handleBreakDown}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        goals={goals}
        onDataChanged={refreshData}
        selectedDate={selectedDate}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
};
