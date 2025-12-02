# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ 🚨 **ABSOLUTE RULE #0: This is an iPhone App, NOT a Web App**

**REBLD is a NATIVE iPhone application wrapped with Capacitor.**

### **Critical Facts:**

1. **Platform: iPhone ONLY**
   - This is NOT a responsive web app
   - This is NOT a desktop app
   - This is a **native iOS app** using web technologies via Capacitor
   - Users install from App Store, not browser

2. **ALL UI/UX Must Be iPhone-Native:**
   - ✅ **Design for 375-430px width ONLY** (iPhone screens)
   - ✅ **Touch-first** - min 44x44pt touch targets (iOS HIG)
   - ✅ **Respect safe areas** - `env(safe-area-inset-top/bottom)` for notch/home indicator
   - ✅ **Use haptic feedback** - via `useHaptic()` hook
   - ✅ **iOS-style interactions** - swipe gestures, bottom sheets, native modals
   - ❌ **NO hover states** - use `:active` instead
   - ❌ **NO desktop layouts** - no sidebars, wide tables, or horizontal scrolling
   - ❌ **NO mouse-specific interactions** - no right-click, drag-and-drop, etc.

3. **Before Changing ANY Component:**
   **ASK YOURSELF:**
   - ✅ Does this work with **thumb reach** on iPhone?
   - ✅ Does this respect **safe areas** (notch, home indicator)?
   - ✅ Does this feel **native** to iOS users?
   - ✅ Can this be used **one-handed**?
   - ✅ Are touch targets ≥ 44x44pt?
   - ❌ Am I adding desktop-only features?

4. **Capacitor Integration:**
   - Use Capacitor plugins for native features
   - Already integrated: Haptics, Keyboard, Storage
   - See `hooks/useAnimations.ts` for haptic feedback
   - See `capacitor.config.ts` for iOS config

5. **Performance Targets:**
   - Smooth 60fps on iPhone 12+
   - Works on cellular (not just WiFi)
   - Minimal battery drain
   - Fast on-device

**VIOLATION OF THIS RULE = BROKEN UX FOR ALL USERS**

---

## 🚨 ABSOLUTE RULE #1: Single Source of Truth

**MASTER.md is the ONLY documentation file that should EVER be updated.**

**THIS IS NON-NEGOTIABLE. VIOLATIONS WILL CAUSE DOCUMENTATION CHAOS.**

### MANDATORY Update Protocol

**AFTER ANY CHANGE (feature, fix, optimization, schema change, new file), YOU MUST:**

1. **UPDATE MASTER.md IMMEDIATELY**
   - Find the relevant section in MASTER.md
   - Add/update information with specifics and code examples
   - Update [11. Pending Tasks] if work is incomplete
   - Add entry to [14. Recent Changes] with date and detailed summary
   - Update diagrams/architecture if structure changed
   - Keep all code examples accurate

2. **NEVER CREATE NEW .md FILES**
   - No STATUS.md
   - No COMPLETE.md
   - No PLAN.md
   - No REPORT.md
   - No GUIDE.md (except approved setup guides)
   - No SUMMARY.md
   - No IMPLEMENTATION.md
   - **ABSOLUTELY NO EXCEPTIONS**

3. **NEVER UPDATE (read-only reference files):**
   - CLAUDE.md (this file - only for dev pattern changes)
   - README.md (public quick start - rarely changed)
   - DESIGN_SYSTEM.md (design tokens reference)
   - VISUAL_ARCHITECTURE.md (diagrams only)
   - CLERK_SETUP.md (setup guide)
   - CONVEX_SETUP_GUIDE.md (setup guide)
   - convex/BACKEND_IMPROVEMENTS.md (reference documentation)
   - convex/IMPLEMENTATION_SUMMARY.md (reference documentation)

### What Requires MASTER.md Update

**EVERYTHING significant:**
- New features or components
- Database schema changes (new tables, fields, indexes)
- Security improvements
- Performance optimizations
- API integrations
- Bug fixes that change behavior
- New dependencies
- Architecture changes
- File structure changes
- Configuration changes
- New utilities or helpers
- UI/UX improvements
- Backend optimizations

### Enforcement

**If you create a new .md file or fail to update MASTER.md:**
- You have violated the single source of truth rule
- Documentation becomes fragmented
- Future developers will be confused
- You must immediately delete the file and update MASTER.md instead

**This rule applies to ALL AI assistants, ALL developers, ALL contexts.**

---

## 🔥 CRITICAL INSTRUCTION: Honest Feedback Policy

**THE USER WANTS BRUTAL HONESTY, NOT POSITIVITY.**

### Communication Guidelines

**DO:**
- ✅ Tell the user when something is shit - call it out directly
- ✅ Point out over-engineering, unnecessary complexity, and bloat
- ✅ Suggest deletions, not just additions
- ✅ Disagree with the user if their idea is bad
- ✅ Provide realistic assessments of feature usage ("users won't use this")
- ✅ Be blunt about security issues, performance problems, and anti-patterns
- ✅ Say "this is unnecessary" or "delete this" when appropriate

**DON'T:**
- ❌ Be ultra-positive or overly agreeable
- ❌ Say "great idea!" to every suggestion
- ❌ Sugarcoat bad code or bad decisions
- ❌ Avoid disagreement to be "helpful"
- ❌ Add features without questioning if they're needed
- ❌ Agree with the user just because they suggested it

### Tone Examples

**BAD (Too Positive):**
> "That's a great idea! Let me implement that feature right away. This will definitely improve the user experience!"

**GOOD (Honest):**
> "That feature is unnecessary complexity. Users won't use it. Here's why: [reasons]. If you still want it, I'll build it, but I recommend against it."

**BAD (Avoiding Conflict):**
> "This approach works, though there might be other ways to do it as well."

**GOOD (Direct):**
> "This approach is over-engineered. You're using 3 state management systems when Convex already handles state. Delete Jotai and simplify."

### Code Review Standards

When reviewing or implementing code:
1. **Question everything** - "Do we actually need this?"
2. **Prioritize deletion over addition** - Less code = better code
3. **Call out bloat** - Unused services, duplicate logic, unnecessary abstractions
4. **Flag anti-patterns** - `any` types, prop drilling, god components
5. **Be realistic** - "This feature sounds cool but users won't use it"

**The user prefers an honest LLM that gives real feedback over a yes-man AI.**

---

## Quick Reference for AI Assistants

### File to Update
- ✅ **MASTER.md** - Update this after EVERY significant change

### Files That Are Read-Only
- ❌ CLAUDE.md (this file)
- ❌ README.md
- ❌ All other .md files (reference only)

### New .md Files
- ❌ **NEVER CREATE NEW .md FILES**
- ✅ Update MASTER.md instead

---

## Project Quick Start

REBLD is an AI-powered workout app for iOS (App Store).

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend:** Convex (real-time database)
- **Auth:** Clerk
- **AI:** Google Gemini (Pro + Flash)
- **Mobile:** Capacitor (iOS)

### Development Commands
```bash
npm install              # Install dependencies
npx convex dev          # Start Convex (keep running)
npm run dev             # Start dev server
npm run tunnel          # Expose via tunnel
npm run build           # Production build
npx cap sync            # Sync to iOS
npx cap open ios        # Open in Xcode
```

### Environment Variables (.env.local)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://...convex.cloud
GEMINI_API_KEY=AIza...
VITE_GEMINI_API_KEY=AIza...
```

---

## Key Development Patterns

### Backend Mutations (Use Utilities)
```typescript
import { withMetrics } from "./utils/performanceMetrics";
import { handleError, validateRequired } from "./utils/errorHandling";
import { loggers } from "./utils/logger";
import { executeWithRollback } from "./utils/transactionHelpers";

export const myMutation = mutation({
  handler: async (ctx, args) => {
    return await withMetrics("myMutation", async () => {
      try {
        validateRequired(args, ["userId"], "myMutation");

        return await executeWithRollback(ctx.db, async (tracker) => {
          const id = await ctx.db.insert("table", {...});
          tracker.trackInsert("table", id);
          return id;
        });
      } catch (error) {
        loggers.mutations.error("Failed:", error);
        handleError(error, "myMutation");
      }
    });
  },
});
```

### Logging (Production-Safe)
```typescript
import { loggers } from "./utils/logger";

// Development only (hidden in production)
loggers.ai.debug("Details:", data);
loggers.mutations.info("Success:", id);

// Always logged
loggers.ai.warn("Slow operation:", ms);
loggers.mutations.error("Failed:", error);
```

### Query Caching
```typescript
import { withCache, exerciseQueryCache } from "./utils/queryCache";

export const getExercise = query({
  handler: async (ctx, args) => {
    return await withCache(
      exerciseQueryCache,
      `exercise:${args.name}`,
      async () => ctx.db.query("exerciseCache")...
    );
  },
});
```

---

## Documentation Rules Summary

1. ✅ **UPDATE MASTER.md** after every significant change
2. ❌ **NEVER CREATE** new .md files
3. ❌ **NEVER UPDATE** read-only reference files (unless instructed)
4. 📝 **ADD TO PENDING TASKS** if work is incomplete
5. 📅 **ADD TO RECENT CHANGES** with date and details

---

**For complete documentation, see MASTER.md (the single source of truth)**
