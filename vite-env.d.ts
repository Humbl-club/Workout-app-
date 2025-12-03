/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_USE_EMULATORS?: string;
  // NOTE: API keys like GEMINI should NEVER be in frontend - they live in Convex env vars
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

