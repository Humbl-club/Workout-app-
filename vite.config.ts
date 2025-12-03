import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Parse .env.local file directly to avoid shell env var conflicts
function parseEnvFile(filepath: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  } catch (e) {
    console.warn('Could not read .env.local:', e);
  }
  return env;
}

export default defineConfig(({ mode }) => {
    // Read .env.local directly, ignoring process.env to avoid stale shell variables
    const fileEnv = parseEnvFile(path.resolve(process.cwd(), '.env.local'));
  return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Environment variables exposed to client
        // NOTE: Use fileEnv (from .env files) not process.env to avoid stale shell variables
        'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(fileEnv.VITE_CLERK_PUBLISHABLE_KEY || ''),
        'import.meta.env.VITE_USE_EMULATORS': JSON.stringify(fileEnv.VITE_USE_EMULATORS || ''),
        'import.meta.env.VITE_CONVEX_URL': JSON.stringify(fileEnv.VITE_CONVEX_URL || ''),
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
