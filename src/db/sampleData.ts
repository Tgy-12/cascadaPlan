import { PlanGoal } from '../types';

export const SAMPLE_GOALS: PlanGoal[] = [
  // 1. YEARLY
  {
    id: 'sample-y1',
    parentId: null,
    horizon: 'yearly',
    title: 'Master Modern Systems Engineering & Build Production SaaS',
    description: `### 2026 North Star Vision
- Build scalable, zero-backend & offline-first Linux tools
- Master TypeScript, Rust, and systems architecture
- Cultivate deep daily focus routines with Pomodoro`,
    status: 'in_progress',
    progress: 42,
    tags: ['#career', '#systems', '#linux'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 2. 6-MONTH (HALF-YEARLY)
  {
    id: 'sample-hy1',
    parentId: 'sample-y1',
    horizon: 'half_yearly',
    title: 'H1: Ship 3 Open-Source Developer Extensions & Tools',
    description: 'Launch tools on GitHub, Firefox Add-ons, and Chrome Web Store.',
    status: 'in_progress',
    progress: 50,
    tags: ['#opensource', '#buildinpublic'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 3. QUARTERLY (3-MONTH)
  {
    id: 'sample-q1',
    parentId: 'sample-hy1',
    horizon: 'quarterly',
    title: 'Q1: Complete CascadePlan Architecture & Dual Build Pipeline',
    description: 'Vite multi-target build for static web + Manifest V3 browser extension.',
    status: 'in_progress',
    progress: 65,
    tags: ['#cascadeplan', '#mv3'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 4. MONTHLY
  {
    id: 'sample-m1',
    parentId: 'sample-q1',
    horizon: 'monthly',
    title: 'November: Complete Offline Storage, Cascade Rollup & Timeline',
    description: 'Implement IndexedDB persistence, auto roll-up calculations, and 06:00-23:00 timeline.',
    status: 'in_progress',
    progress: 75,
    tags: ['#storage', '#timeline'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 5. BI-WEEKLY (2-WEEK)
  {
    id: 'sample-bw1',
    parentId: 'sample-m1',
    horizon: 'biweekly',
    title: 'Sprint 24: Polish Developer UX & Linux Themes',
    description: 'Ubuntu Yaru Dark, Dracula, Nord themes, Ctrl+K quick add, and Markdown editor.',
    status: 'in_progress',
    progress: 80,
    tags: ['#ux', '#themes'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 6. WEEKLY
  {
    id: 'sample-w1',
    parentId: 'sample-bw1',
    horizon: 'weekly',
    title: 'Week 47: Implement Built-in Pomodoro & Keyboard Shortcuts',
    description: '25m work / 5m break timer with Web Audio chime and Ctrl+K command modal.',
    status: 'in_progress',
    progress: 90,
    tags: ['#pomodoro', '#shortcuts'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 7. DAILY
  {
    id: 'sample-d1',
    parentId: 'sample-w1',
    horizon: 'daily',
    title: "Today: Finish Hourly Action Planner & Test On Ubuntu Chromium/Firefox",
    description: `### Daily Focus Checklist
- [x] Test IndexedDB local state persistence
- [ ] Schedule hourly time blocks for deep work
- [ ] Run 4 Pomodoro focus sprints`,
    status: 'in_progress',
    progress: 60,
    date: new Date().toISOString().split('T')[0],
    tags: ['#daily', '#deepwork'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 8. HOURLY TIME BLOCKS
  {
    id: 'sample-h1',
    parentId: 'sample-d1',
    horizon: 'hourly',
    title: 'Deep Work Block: Core Cascading Roll-up Engine',
    description: 'Calculate parent percentages dynamically on leaf task toggles.',
    status: 'completed',
    progress: 100,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '09:00',
    durationMinutes: 60,
    pomodoroCount: 2,
    tags: ['#algorithms'],
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-h2',
    parentId: 'sample-d1',
    horizon: 'hourly',
    title: 'Daily Action Timeline & Pomodoro Sound Synthesizer',
    description: 'Connect 06:00-23:00 grid with audio synthesis for 25m/5m cycles.',
    status: 'in_progress',
    progress: 50,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:00',
    durationMinutes: 60,
    pomodoroCount: 1,
    tags: ['#audio', '#ui'],
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-h3',
    parentId: 'sample-d1',
    horizon: 'hourly',
    title: 'Dual-target packaging & Ubuntu testing',
    description: 'Test standalone static web app and load unpacked extension in Chrome & Firefox.',
    status: 'todo',
    progress: 0,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '15:00',
    durationMinutes: 60,
    pomodoroCount: 0,
    tags: ['#build', '#testing'],
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
