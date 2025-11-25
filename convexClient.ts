import { ConvexReactClient } from "convex/react";

// Get Convex deployment URL from environment variable
// This will be set when you run `npx convex dev`
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  console.warn(
    "⚠️ VITE_CONVEX_URL is not set. Please run 'npx convex dev' to configure Convex."
  );
  console.warn(
    "📝 The app will load, but database features won't work until Convex is configured."
  );
}

// ConvexReactClient requires a valid URL format
// Use a dummy URL that won't cause initialization errors
// Queries will gracefully skip when userId is null anyway
const safeUrl = convexUrl || "https://placeholder.convex.site";

export const convex = new ConvexReactClient(safeUrl);
