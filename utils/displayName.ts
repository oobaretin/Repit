export const DISPLAY_NAME_STORAGE_KEY = 'repit-displayName';

const MAX_DISPLAY_NAME_LENGTH = 32;

/** Trim and cap length for local storage. */
export function normalizeDisplayName(value: string): string {
  return value.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
}

/** First word for short greetings. */
export function formatFirstName(name: string): string {
  const trimmed = normalizeDisplayName(name);
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? '';
}

export function welcomeGreeting(name: string): string {
  const first = formatFirstName(name);
  return first ? `Welcome back, ${first}` : 'Welcome back';
}

export function sessionCompleteGreeting(name: string): string {
  const first = formatFirstName(name);
  return first ? `Well done, ${first}` : 'Well done';
}
