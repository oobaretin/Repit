import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.repit.app',
  appName: 'Repit',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#111827',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#111827',
    },
    Keyboard: {
      resize: 'body',
    },
  },
};

export default config;
