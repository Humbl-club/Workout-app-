import type { CapacitorConfig } from '@capacitor/cli';

// Set to true for development (live reload), false for production builds
const isDevelopment = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.rebld.app',
  appName: 'REBLD',
  webDir: 'dist',
  ios: {
    contentInset: 'never', // Don't add insets - we handle safe areas in CSS
    preferredContentMode: 'mobile',
    scheme: 'REBLD',
    backgroundColor: '#000000', // Match app background
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // We manually hide when HTML is ready
      launchShowDuration: 3000, // Max time before auto-hide (fallback)
      backgroundColor: '#0A0A0A', // Match HTML splash exactly
      showSpinner: false,
      launchFadeOutDuration: 200, // Quick fade when we hide it
    },
    StatusBar: {
      style: 'light', // Light text for dark background
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  // Development server - ONLY used when running `npm run dev`
  // For production: run `npm run build && npx cap sync` (no server block needed)
  ...(isDevelopment && {
    server: {
      url: 'http://localhost:3000',
      cleartext: true,
    },
  }),
};

export default config;
