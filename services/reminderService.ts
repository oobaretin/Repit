import { Capacitor } from '@capacitor/core';

export interface PracticeReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface ReminderSyncResult {
  ok: boolean;
  message: string;
}

const REMINDER_ID = 1001;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatReminderTime(hour: number, minute: number): string {
  const h = Math.min(23, Math.max(0, Math.floor(hour)));
  const m = Math.min(59, Math.max(0, Math.floor(minute)));
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function parseReminderTimeInput(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(':').map((part) => parseInt(part, 10));
  return {
    hour: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 8,
    minute: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  };
}

export function reminderTimeInputValue(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** Stub until @capacitor/local-notifications is added with Apple Developer entitlements. */
class ReminderService {
  async sync(settings: PracticeReminderSettings): Promise<ReminderSyncResult> {
    if (!settings.enabled) {
      return {
        ok: true,
        message: 'Daily reminder off.',
      };
    }

    const at = formatReminderTime(settings.hour, settings.minute);

    if (!Capacitor.isNativePlatform()) {
      return {
        ok: true,
        message: `Saved for ${at} daily — notifications fire on iOS after the next native update.`,
      };
    }

    // Reserved for Local Notifications plugin (id REMINDER_ID).
    void REMINDER_ID;

    return {
      ok: true,
      message: `Saved for ${at} daily — push scheduling ships with the notifications update.`,
    };
  }
}

export const reminderService = new ReminderService();
