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
        // Environment variables exposed to client
        // NOTE: Gemini API key is now server-side only (in Convex env vars)
        'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || ''),
        'import.meta.env.VITE_USE_EMULATORS': JSON.stringify(env.VITE_USE_EMULATORS || env.USE_EMULATORS || ''),
        'import.meta.env.VITE_CONVEX_URL': JSON.stringify(env.VITE_CONVEX_URL || ''),
        // Define process.env for legacy code compatibility (AI calls now use Convex server-side)
        'process.env.API_KEY': JSON.stringify(''),
        'process.env.GEMINI_API_KEY': JSON.stringify(''),
        'process.env': JSON.stringify({}),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
