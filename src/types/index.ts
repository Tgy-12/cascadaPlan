export type TimeHorizon =
  | 'yearly'
  | 'half_yearly'
  | 'quarterly'
  | 'monthly'
  | 'biweekly'
  | 'weekly'
  | 'daily'
  | 'hourly';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';

export interface PlanGoal {
  id: string;
  parentId: string | null;
  horizon: TimeHorizon;
  title: string;
  description: string; // Markdown notes
  status: TaskStatus;
  progress: number; // 0 - 100
  date?: string; // YYYY-MM-DD for daily/hourly
  timeSlot?: string; // e.g. "09:00", "14:00" for hourly start time
  endTime?: string; // e.g. "11:00"
  durationMinutes?: number; // duration in minutes (e.g. 40, 60, 120, 240)
  alarmEnabled?: boolean; // sound/notification alarm when start time is reached
  alarmTriggered?: boolean;
  pomodoroCount?: number; // Pomodoros completed
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface HorizonMeta {
  id: TimeHorizon;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  accentColor: string;
  nextHorizon: TimeHorizon | null;
  parentHorizon: TimeHorizon | null;
}

export const HORIZONS: HorizonMeta[] = [
  {
    id: 'yearly',
    label: 'Yearly',
    shortLabel: '1Y',
    description: 'Long-term vision & North Stars',
    badgeClass: 'badge-yearly',
    accentColor: '#a855f7',
    nextHorizon: 'half_yearly',
    parentHorizon: null,
  },
  {
    id: 'half_yearly',
    label: '6-Month',
    shortLabel: '6M',
    description: 'Semi-annual strategic milestones',
    badgeClass: 'badge-half-yearly',
    accentColor: '#6366f1',
    nextHorizon: 'quarterly',
    parentHorizon: 'yearly',
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    shortLabel: '3M',
    description: 'Quarterly OKRs & 3-month goals',
    badgeClass: 'badge-quarterly',
    accentColor: '#3b82f6',
    nextHorizon: 'monthly',
    parentHorizon: 'half_yearly',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    shortLabel: '1M',
    description: 'Monthly sprints & project epics',
    badgeClass: 'badge-monthly',
    accentColor: '#06b6d4',
    nextHorizon: 'biweekly',
    parentHorizon: 'quarterly',
  },
  {
    id: 'biweekly',
    label: 'Bi-Weekly',
    shortLabel: '2W',
    description: '2-week sprint cycles',
    badgeClass: 'badge-biweekly',
    accentColor: '#10b981',
    nextHorizon: 'weekly',
    parentHorizon: 'monthly',
  },
  {
    id: 'weekly',
    label: 'Weekly',
    shortLabel: '1W',
    description: 'Weekly habits & target deliveries',
    badgeClass: 'badge-weekly',
    accentColor: '#eab308',
    nextHorizon: 'daily',
    parentHorizon: 'biweekly',
  },
  {
    id: 'daily',
    label: 'Daily',
    shortLabel: '1D',
    description: 'Daily must-win tasks',
    badgeClass: 'badge-daily',
    accentColor: '#f97316',
    nextHorizon: 'hourly',
    parentHorizon: 'weekly',
  },
  {
    id: 'hourly',
    label: 'Hourly Blocks',
    shortLabel: '1H',
    description: 'Scheduled execution (06:00 - 23:00)',
    badgeClass: 'badge-hourly',
    accentColor: '#ef4444',
    nextHorizon: null,
    parentHorizon: 'daily',
  },
];

export type AppTheme = 'ubuntu-dark' | 'dracula' | 'nord' | 'clean-light';

export interface AppSettings {
  theme: AppTheme;
  pomodoroWorkDuration: number; // minutes, default 25
  pomodoroBreakDuration: number; // minutes, default 5
  autoStartBreak: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  defaultView: 'cascade' | 'daily' | 'matrix';
  isExtensionPopup: boolean;
}

export interface CascadeFilter {
  horizon?: TimeHorizon | 'all';
  searchQuery: string;
  tag?: string;
  status?: TaskStatus | 'all';
}
