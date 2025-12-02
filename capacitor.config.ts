import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rebld.app',
  appName: 'REBLD',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'REBLD',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#FAF8F6',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FAF8F6',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  server: {
    // For development - load from Vite dev server
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
