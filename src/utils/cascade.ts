import { PlanGoal, TimeHorizon, HORIZONS } from '../types';

export function getNextHorizon(horizon: TimeHorizon): TimeHorizon | null {
  const meta = HORIZONS.find((h) => h.id === horizon);
  return meta ? meta.nextHorizon : null;
}

export function getParentHorizon(horizon: TimeHorizon): TimeHorizon | null {
  const meta = HORIZONS.find((h) => h.id === horizon);
  return meta ? meta.parentHorizon : null;
}

/**
 * Recomputes progress and status rollups across the entire cascading tree.
 * Processes bottom-up so higher horizons reflect the updated state of lower horizons.
 */
export function recalculateAllRollups(goals: PlanGoal[]): PlanGoal[] {
  const goalsMap = new Map<string, PlanGoal>(goals.map((g) => [g.id, { ...g }]));

  // Build parent -> children map
  const childrenMap = new Map<string, string[]>();
  for (const g of goalsMap.values()) {
    if (g.parentId) {
      const list = childrenMap.get(g.parentId) || [];
      list.push(g.id);
      childrenMap.set(g.parentId, list);
    }
  }

  // Processing order: bottom to top
  // hourly -> daily -> weekly -> biweekly -> monthly -> quarterly -> half_yearly -> yearly
  const horizonOrder: TimeHorizon[] = [
    'hourly',
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'quarterly',
    'half_yearly',
    'yearly',
  ];

  for (const horizon of horizonOrder) {
    for (const goal of goalsMap.values()) {
      if (goal.horizon !== horizon) continue;

      const childIds = childrenMap.get(goal.id);
      if (childIds && childIds.length > 0) {
        // Parent node with children: calculate roll-up average
        const children = childIds
          .map((id) => goalsMap.get(id))
          .filter((c): c is PlanGoal => Boolean(c));

        if (children.length > 0) {
          const totalProgress = children.reduce((acc, c) => acc + (c.progress || 0), 0);
          const avgProgress = Math.round(totalProgress / children.length);
          goal.progress = avgProgress;

          if (avgProgress === 100) {
            goal.status = 'completed';
          } else if (avgProgress === 0) {
            goal.status = 'todo';
          } else {
            goal.status = 'in_progress';
          }
        }
      } else {
        // Leaf node: keep progress aligned with status
        if (goal.status === 'completed') {
          goal.progress = 100;
        } else if (goal.status === 'todo' && goal.progress === 100) {
          goal.progress = 0;
        }
      }
      goal.updatedAt = new Date().toISOString();
    }
  }

  return Array.from(goalsMap.values());
}

/**
 * Toggles a goal's completed status and updates its descendants and ancestors.
 */
export function toggleGoalStatus(goalId: string, allGoals: PlanGoal[]): PlanGoal[] {
  const goalsMap = new Map<string, PlanGoal>(allGoals.map((g) => [g.id, { ...g }]));
  const target = goalsMap.get(goalId);
  if (!target) return allGoals;

  const isNowCompleted = target.status !== 'completed';
  const newStatus = isNowCompleted ? 'completed' : 'todo';
  const newProgress = isNowCompleted ? 100 : 0;

  target.status = newStatus;
  target.progress = newProgress;
  target.updatedAt = new Date().toISOString();

  // Find all descendant IDs and update them to match
  const descendants = getAllDescendantIds(goalId, allGoals);
  for (const descId of descendants) {
    const desc = goalsMap.get(descId);
    if (desc) {
      desc.status = newStatus;
      desc.progress = newProgress;
      desc.updatedAt = new Date().toISOString();
    }
  }

  // Recalculate rollup for all ancestors and nodes
  return recalculateAllRollups(Array.from(goalsMap.values()));
}

/**
 * Returns all descendant IDs for a given goal.
 */
export function getAllDescendantIds(goalId: string, allGoals: PlanGoal[]): string[] {
  const result: string[] = [];
  const queue: string[] = [goalId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const g of allGoals) {
      if (g.parentId === currentId && !result.includes(g.id)) {
        result.push(g.id);
        queue.push(g.id);
      }
    }
  }

  return result;
}

/**
 * Returns ancestor chain from top-level down to parent.
 */
export function getBreadcrumbChain(goalId: string, allGoals: PlanGoal[]): PlanGoal[] {
  const map = new Map(allGoals.map((g) => [g.id, g]));
  const chain: PlanGoal[] = [];

  let current = map.get(goalId);
  while (current && current.parentId) {
    const parent = map.get(current.parentId);
    if (parent) {
      chain.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  return chain;
}
