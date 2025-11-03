# REBLD - Critical Mobile Fixes Summary

**Status**: Base typography fixed, PreWorkoutScreen removed
**Remaining**: SessionTracker and page refinements needed

---

## ✅ Completed

1. **Typography reduced**:
   - Body: 15px → 14px
   - H1: 28px → 20px
   - H2: 22px → 18px
   - H3: 18px → 16px
   - Line height: 1.6 → 1.4

2. **PreWorkoutScreen removed**:
   - No more equipment check screen
   - Direct start to workout
   - "START WORKOUT" button

3. **HomePage button updated**:
   - "Prepare to Start" → "START WORKOUT"
   - Smaller button (py-3 vs py-4)
   - Compact icon

---

## 🔧 SessionTracker Fixes Needed

**File**: components/SessionTracker.tsx

**Critical size reductions:**

**Line 236-238**: Exercise name (text-4xl = 48px → text-2xl = 18px)
```tsx
// CHANGE FROM:
<h1 className="font-syne text-4xl font-bold...">

// TO:
<h1 className="font-syne text-2xl font-bold...">
```

**Line 227**: Reduce padding (py-8 → py-4)
```tsx
// CHANGE FROM:
<div className="flex-1 flex flex-col px-5 py-8...">

// TO:
<div className="flex-1 flex flex-col px-4 py-4...">
```

**Lines 278-297**: Input fields (text-[24px] → text-[18px])
```tsx
// CHANGE FROM:
className="... text-[24px] font-bold..."

// TO:
className="... text-[18px] font-bold..."
```

**Line 313**: Button (py-5 → py-3, text-[18px] → text-[14px])
```tsx
// CHANGE FROM:
className="... py-5 ... text-[18px] ..."

// TO:
className="... py-3 ... text-[14px] ..."
```

---

## 📱 All Pages Need

### **Consistent Changes Across All Files:**

1. **Max Width**: `max-w-2xl` → `max-w-xl` (768px → 576px)
2. **Padding**: `px-5` → `px-4` (20px → 16px)
3. **Card Padding**: `p-5 sm:p-6` → `p-4` (20-24px → 16px)
4. **Gaps**: `space-y-6` → `space-y-4` (24px → 16px)
5. **Button Height**: `py-4` → `py-3` (16px → 12px vertical padding)

---

## 🎯 Files to Update (In Order)

1. ✅ index.html - Typography base (DONE)
2. ✅ App.tsx - Remove PreWorkout (DONE)
3. ✅ HomePage.tsx - Button updated (DONE)
4. ⏳ **SessionTracker.tsx** - Critical (NEEDS WORK)
5. ⏳ GoalTrackingPage.tsx
6. ⏳ PlanPage.tsx
7. ⏳ ProfilePage.tsx
8. ⏳ RestTimer.tsx
9. ⏳ BlockCompletionScreen.tsx
10. ⏳ VictoryScreen.tsx

---

## 🚀 Quick Reference: Mobile Size System

```
Typography (Mobile):
10px - Tiny labels (CAPS)
12px - Small text, metrics
14px - Body, buttons
16px - Emphasized text
18px - Card headings
20px - Page headings
24px - Hero text (rare)

Spacing:
8px - Tight gaps (between metrics)
12px - Card gaps
16px - Card padding, section gaps
24px - Large section breaks (rare)

Components:
Buttons: 44-48px height
Icons: 16-18px
Cards: 16px padding, 8px radius
Touch targets: 44px minimum
```

---

**Next session**: Apply compact sizing to SessionTracker and all pages systematically.

**Current token usage**: 518K/1M - Stopping to preserve context for next session.
