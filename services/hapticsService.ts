import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class HapticsService {
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  async light() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } catch {
        // Fall through to web vibration
      }
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  async medium() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      } catch {
        // Fall through
      }
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }

  async success() {
    if (!this.enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      } catch {
        // Fall through
      }
    }
    if ('vibrate' in navigator) {
      navigator.vibrate([15, 40, 15]);
    }
  }
}

export const hapticsService = new HapticsService();
