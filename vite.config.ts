import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
  return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // SECURITY: API keys moved to server-side (Convex actions)
        // Only expose public keys and non-sensitive config
        'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
        'import.meta.env.VITE_USE_EMULATORS': JSON.stringify(env.VITE_USE_EMULATORS || env.USE_EMULATORS || ''),
        'import.meta.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
