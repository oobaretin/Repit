import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';

class NativeService {
  private initialized = false;

  async initialize() {
    if (this.initialized || !Capacitor.isNativePlatform()) return;
    this.initialized = true;

    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#060912' });
    } catch {
      // Status bar plugin unavailable
    }
  }

  async setKeepAwake(enabled: boolean) {
    if (!Capacitor.isNativePlatform()) return;

    try {
      if (enabled) {
        await KeepAwake.keepAwake();
      } else {
        await KeepAwake.allowSleep();
      }
    } catch {
      // Keep awake unavailable
    }
  }

  onAppStateChange(callback: (isActive: boolean) => void) {
    if (!Capacitor.isNativePlatform()) return () => {};

    const listener = App.addListener('appStateChange', ({ isActive }) => {
      callback(isActive);
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }
}

export const nativeService = new NativeService();
