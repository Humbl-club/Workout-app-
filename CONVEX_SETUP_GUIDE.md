# Convex Database Configuration Guide

## Current Status

✅ Convex schema created (`convex/schema.ts`)
✅ Convex functions created (queries, mutations, auth)
✅ Convex files generated (`convex/_generated/`)
❌ Convex project not linked (needs deployment URL)

## Quick Setup

### Step 1: Initialize Convex Project

Run this command in your terminal:

```bash
npx convex dev
```

**What this does:**
1. Prompts you to log in to Convex (create account if needed)
2. Creates a new Convex project or links to existing one
3. Generates a deployment URL
4. Adds `VITE_CONVEX_URL` to your `.env.local` file
5. Starts watching and deploying your Convex functions

### Step 2: Verify Configuration

After running `npx convex dev`, check that `.env.local` now contains:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### Step 3: Test the Connection

1. Keep `npx convex dev` running in one terminal
2. In another terminal, run `npm run dev`
3. Your app should now connect to Convex!

## What Happens During Setup

When you run `npx convex dev`:

1. **Authentication**: You'll be asked to log in to Convex (free account)
2. **Project Creation**: Convex creates a new project for you
3. **Schema Deployment**: Your `convex/schema.ts` is deployed
4. **Function Deployment**: All your queries/mutations are deployed
5. **Environment Setup**: `.env.local` is updated with the deployment URL

## Database Structure

Your Convex database has these tables:

- **users** - User profiles (linked to Clerk user IDs)
- **workoutPlans** - User workout plans
- **workoutLogs** - Completed workout sessions
- **exerciseHistory** - Exercise history per user
- **exerciseCache** - Global exercise explanations cache

## Troubleshooting

### If `npx convex dev` fails:

1. Make sure you're logged in: `npx convex login`
2. Check your internet connection
3. Try: `npx convex dev --once` (one-time deployment)

### If the app still shows warnings:

1. Make sure `.env.local` has `VITE_CONVEX_URL`
2. Restart your Vite dev server (`npm run dev`)
3. Check that `npx convex dev` is still running

## Next Steps After Configuration

Once Convex is configured:

1. ✅ Database is ready
2. ✅ All functions are deployed
3. ✅ App can read/write data
4. ✅ Real-time updates work automatically

Your workout app will be fully functional!

