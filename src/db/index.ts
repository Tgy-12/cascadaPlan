import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { PlanGoal, AppSettings } from '../types';
import { SAMPLE_GOALS } from './sampleData';

const DB_NAME = 'cascade_plan_db';
const DB_VERSION = 1;

interface CascadePlanDB extends DBSchema {
  goals: {
    key: string;
    value: PlanGoal;
    indexes: {
      'by-parent': string;
      'by-horizon': string;
      'by-date': string;
      'by-status': string;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<CascadePlanDB>> | null = null;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'ubuntu-dark',
  pomodoroWorkDuration: 25,
  pomodoroBreakDuration: 5,
  autoStartBreak: false,
  soundEnabled: true,
  notificationsEnabled: true,
  defaultView: 'cascade',
  isExtensionPopup: false,
};

export async function getDB(): Promise<IDBPDatabase<CascadePlanDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CascadePlanDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Goals store
        if (!db.objectStoreNames.contains('goals')) {
          const goalStore = db.createObjectStore('goals', { keyPath: 'id' });
          goalStore.createIndex('by-parent', 'parentId');
          goalStore.createIndex('by-horizon', 'horizon');
          goalStore.createIndex('by-date', 'date');
          goalStore.createIndex('by-status', 'status');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export async function loadAllGoals(): Promise<PlanGoal[]> {
  try {
    const db = await getDB();
    const goals = await db.getAll('goals');
    if (!goals || goals.length === 0) {
      await saveGoalsBatch(SAMPLE_GOALS);
      return SAMPLE_GOALS;
    }
    return goals;
  } catch (err) {
    console.warn('IndexedDB failed, falling back to localStorage:', err);
    const local = localStorage.getItem('cascade_plan_goals');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return SAMPLE_GOALS;
      }
    }
    localStorage.setItem('cascade_plan_goals', JSON.stringify(SAMPLE_GOALS));
    return SAMPLE_GOALS;
  }
}

export async function saveGoal(goal: PlanGoal): Promise<void> {
  try {
    const db = await getDB();
    await db.put('goals', goal);
    backupGoalsToLocalStorage();
  } catch (err) {
    console.error('Failed to save goal to IndexedDB:', err);
  }
}

export async function saveGoalsBatch(goals: PlanGoal[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('goals', 'readwrite');
    for (const g of goals) {
      await tx.store.put(g);
    }
    await tx.done;
    backupGoalsToLocalStorage();
  } catch (err) {
    console.error('Failed to save goals batch to IndexedDB:', err);
  }
}

export async function deleteGoalCascade(id: string): Promise<string[]> {
  try {
    const db = await getDB();
    const all = await db.getAll('goals');

    // Collect all descendant IDs
    const toDeleteIds = new Set<string>();
    toDeleteIds.add(id);

    let changed = true;
    while (changed) {
      changed = false;
      for (const g of all) {
        if (g.parentId && toDeleteIds.has(g.parentId) && !toDeleteIds.has(g.id)) {
          toDeleteIds.add(g.id);
          changed = true;
        }
      }
    }

    const tx = db.transaction('goals', 'readwrite');
    for (const delId of toDeleteIds) {
      await tx.store.delete(delId);
    }
    await tx.done;
    backupGoalsToLocalStorage();
    return Array.from(toDeleteIds);
  } catch (err) {
    console.error('Failed to cascade delete in IndexedDB:', err);
    return [id];
  }
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const db = await getDB();
    const settings = await db.get('settings', 'app_settings');
    if (settings) {
      return { ...DEFAULT_SETTINGS, ...settings };
    }
    const local = localStorage.getItem('cascade_plan_settings');
    if (local) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const db = await getDB();
    await db.put('settings', settings, 'app_settings');
    localStorage.setItem('cascade_plan_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
    localStorage.setItem('cascade_plan_settings', JSON.stringify(settings));
  }
}

export async function exportDatabaseJSON(): Promise<string> {
  const goals = await loadAllGoals();
  const settings = await loadSettings();
  const payload = {
    app: 'CascadePlan',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    goals,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importDatabaseJSON(jsonStr: string): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.goals || !Array.isArray(data.goals)) {
      return { success: false, count: 0, message: 'Invalid file format: missing "goals" array.' };
    }

    const db = await getDB();
    const tx = db.transaction(['goals', 'settings'], 'readwrite');
    await tx.objectStore('goals').clear();

    for (const g of data.goals) {
      await tx.objectStore('goals').put(g);
    }

    if (data.settings) {
      await tx.objectStore('settings').put(data.settings, 'app_settings');
    }

    await tx.done;
    backupGoalsToLocalStorage();
    return { success: true, count: data.goals.length, message: `Successfully imported ${data.goals.length} items.` };
  } catch (err: any) {
    return { success: false, count: 0, message: err.message || 'Failed to parse JSON file.' };
  }
}

export async function resetDatabaseToSample(): Promise<PlanGoal[]> {
  const db = await getDB();
  const tx = db.transaction('goals', 'readwrite');
  await tx.store.clear();
  for (const g of SAMPLE_GOALS) {
    await tx.store.put(g);
  }
  await tx.done;
  backupGoalsToLocalStorage();
  return SAMPLE_GOALS;
}

async function backupGoalsToLocalStorage() {
  try {
    const db = await getDB();
    const goals = await db.getAll('goals');
    localStorage.setItem('cascade_plan_goals', JSON.stringify(goals));
  } catch {
    // ignore
  }
}
