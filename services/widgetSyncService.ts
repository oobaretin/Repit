import { Capacitor, registerPlugin } from '@capacitor/core';

export interface WidgetSyncPlugin {
  sync(options: {
    currentStreak: number;
    repsThisWeek: number;
    totalSessions: number;
  }): Promise<void>;
}

const WidgetSync = registerPlugin<WidgetSyncPlugin>('WidgetSync');

export async function syncWidgetData(data: {
  currentStreak: number;
  repsThisWeek: number;
  totalSessions: number;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await WidgetSync.sync(data);
  } catch {
    // Widget extension may not be configured yet — safe to ignore.
  }
}
