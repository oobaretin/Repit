import type { SessionRecord } from '../types';

/** Local calendar date as YYYY-MM-DD (for streaks). */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateKeyFromIso(iso: string): string {
  return localDateKey(new Date(iso));
}

function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function uniquePracticeDays(history: SessionRecord[]): string[] {
  return [...new Set(history.map((r) => dateKeyFromIso(r.completedAt)))].sort();
}

export function computeLongestStreak(history: SessionRecord[]): number {
  const days = uniquePracticeDays(history);
  if (days.length === 0) return 0;
  if (days.length === 1) return 1;

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    if (previousDayKey(days[i]) === days[i - 1]) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }
  return longest;
}

/** Consecutive practice days ending today, or yesterday if none today. */
export function computeCurrentStreak(history: SessionRecord[]): number {
  if (history.length === 0) return 0;

  const daySet = new Set(history.map((r) => dateKeyFromIso(r.completedAt)));
  const today = localDateKey();
  let anchor = today;

  if (!daySet.has(today)) {
    anchor = previousDayKey(today);
    if (!daySet.has(anchor)) return 0;
  }

  let streak = 0;
  let cursor = anchor;
  while (daySet.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }
  return streak;
}

export function repsInLastDays(history: SessionRecord[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return history
    .filter((r) => new Date(r.completedAt).getTime() >= cutoff)
    .reduce((sum, r) => sum + r.reps, 0);
}

export function appendSessionRecord(
  history: SessionRecord[],
  record: SessionRecord,
  maxEntries: number,
): SessionRecord[] {
  return [record, ...history].slice(0, maxEntries);
}

export function formatHistoryDate(iso: string): string {
  const date = new Date(iso);
  const today = localDateKey();
  const key = dateKeyFromIso(iso);
  if (key === today) return 'Today';
  if (key === previousDayKey(today)) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
