import { Capacitor, registerPlugin } from '@capacitor/core';
import type { SoundOption } from '../types';

export interface WidgetSyncPayload {
  currentStreak: number;
  repsThisWeek: number;
  totalSessions: number;
  targetReps: number;
  delay: number;
  sound: SoundOption;
}

export interface WidgetSyncPlugin {
  sync(options: WidgetSyncPayload): Promise<void>;
}

const WidgetSync = registerPlugin<WidgetSyncPlugin>('WidgetSync');

export async function syncWidgetData(data: WidgetSyncPayload): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await WidgetSync.sync(data);
  } catch {
    // Widget extension may not be configured yet — safe to ignore.
  }
}
