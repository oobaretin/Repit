import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.repit.app',
  appName: 'Repit',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#060912',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#060912',
    },
    Keyboard: {
      resize: 'body',
    },
  },
};

export default config;
