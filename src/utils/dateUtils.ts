/**
 * Date and time range utilities for CascadePlan
 */

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime || !startTime.includes(':')) return '10:00';
  const [hoursStr, minsStr] = startTime.split(':');
  const totalMins = parseInt(hoursStr, 10) * 60 + parseInt(minsStr, 10) + durationMinutes;

  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;

  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
}

/**
 * Checks if a specific hour slot (e.g. "09:00") is covered by a task starting at taskStartTime
 * with durationMinutes.
 */
export function isSlotCoveredByTask(
  slotHourStr: string,
  taskStartTime: string,
  durationMinutes: number = 60
): { isStart: boolean; isOngoing: boolean } {
  if (!taskStartTime) return { isStart: false, isOngoing: false };

  const slotHour = parseInt(slotHourStr.split(':')[0], 10);
  const startHour = parseInt(taskStartTime.split(':')[0], 10);
  const startMin = parseInt(taskStartTime.split(':')[1] || '0', 10);

  const slotStartMins = slotHour * 60;
  const slotEndMins = (slotHour + 1) * 60;

  const taskStartMins = startHour * 60 + startMin;
  const taskEndMins = taskStartMins + durationMinutes;

  const isStart = startHour === slotHour;
  const isOngoing = taskStartMins < slotEndMins && taskEndMins > slotStartMins && !isStart;

  return { isStart, isOngoing };
}

/**
 * Common duration options for fast selection
 */
export const DURATION_PRESETS = [
  { label: '25m', minutes: 25 },
  { label: '40m', minutes: 40 },
  { label: '1h', minutes: 60 },
  { label: '1.5h', minutes: 90 },
  { label: '2h', minutes: 120 },
  { label: '3h', minutes: 180 },
  { label: '4h', minutes: 240 },
  { label: '8h', minutes: 480 },
];
