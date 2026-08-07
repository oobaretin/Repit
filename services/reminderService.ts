import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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

function clampReminderTime(hour: number, minute: number): { hour: number; minute: number } {
  return {
    hour: Math.min(23, Math.max(0, Math.floor(hour))),
    minute: Math.min(59, Math.max(0, Math.floor(minute))),
  };
}

class ReminderService {
  private async cancelReminder(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  }

  async sync(settings: PracticeReminderSettings): Promise<ReminderSyncResult> {
    if (!settings.enabled) {
      await this.cancelReminder();
      return {
        ok: true,
        message: 'Daily reminder off.',
      };
    }

    const { hour, minute } = clampReminderTime(settings.hour, settings.minute);
    const at = formatReminderTime(hour, minute);

    if (!Capacitor.isNativePlatform()) {
      return {
        ok: true,
        message: `Saved for ${at} daily — reminders schedule on iOS and iPad.`,
      };
    }

    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      return {
        ok: false,
        message: 'Allow notifications in Settings to enable your daily reminder.',
      };
    }

    await this.cancelReminder();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title: 'Time for practice',
          body: 'Open Repit for your daily repetition session.',
          schedule: {
            on: { hour, minute },
            repeats: true,
            allowWhileIdle: true,
          },
        },
      ],
    });

    return {
      ok: true,
      message: `Daily reminder set for ${at}.`,
    };
  }
}

export const reminderService = new ReminderService();
