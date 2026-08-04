const MAX_PRACTICE_INTENTION_LENGTH = 48;

/** Trim and cap length for local mantra / intention storage. */
export function normalizePracticeIntention(value: string): string {
  return value.trim().slice(0, MAX_PRACTICE_INTENTION_LENGTH);
}
