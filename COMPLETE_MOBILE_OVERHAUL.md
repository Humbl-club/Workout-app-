# REBLD - Complete Mobile Overhaul - The Definitive Plan

**Status**: Ready for systematic execution
**Goal**: Transform into sophisticated, compact, mobile-optimized app
**Estimated**: 4-5 hours systematic work

---

## 🎯 Core Problem

**Everything is 30-50% too large for mobile screens**

Current app designed desktop-first, then squeezed to mobile.
Need: Mobile-first from scratch, elegant and functional.

---

## 📏 NEW SIZE SYSTEM (The Foundation)

### **Typography**
```
9px:  Micro labels (CAPS only)
11px: Secondary info, small metrics
13px: Body text, button text
14px: Emphasized text
16px: Card headings
18px: Page headings
20px: Hero text (rare)
24px: Dramatic moments only
```

### **Spacing**
```
4px:  Tight gaps (metrics)
8px:  Standard gaps
12px: Card padding, card gaps
16px: Section breaks
24px: Large breaks (rare)
```

### **Components**
```
Buttons: 44px height
Cards: 12px padding, 6px radius
Icons: 16px standard
Inputs: 12px padding, 16px text
Progress: 6px height
Max width: 540px
```

---

## 📋 File-by-File Changes

### **1. index.html** (Foundation)

**Lines 76-100: Body & Typography**
```css
body {
  font-size: 13px;  /* was 14-15px */
  line-height: 1.3; /* was 1.4-1.6 */
}

h1, .text-3xl {
  font-size: 18px;  /* was 20-28px */
}

h2, .text-2xl {
  font-size: 16px;  /* was 18-22px */
}

h3, .text-xl {
  font-size: 14px;  /* was 16-18px */
}
```

**Delete lines 213-253**: All gradient utilities (unused, waste)

---

### **2. SessionTracker.tsx** (CRITICAL)

**Line 347**: Max width
```tsx
// FROM: max-w-2xl (768px)
// TO: max-w-lg (512px)
```

**Line 350**: Header padding
```tsx
// FROM: px-4 py-3
// TO: px-3 py-2
```

**Line 373**: Main padding
```tsx
// FROM: px-4 py-4
// TO: px-3 py-3
```

**Line 376-379**: Set info
```tsx
// FROM: text-[10px] ... mb-2
// TO: text-[9px] ... mb-1
```

**Line 382-384**: Exercise name
```tsx
// FROM: text-2xl (18px) ... mb-3
// TO: text-xl (14px) ... mb-2
```

**Line 387-403**: Metrics
```tsx
// FROM: gap-3 text-[14px]
// TO: gap-2 text-[12px]

// Icons FROM: w-4 h-4
// TO: w-3.5 h-3.5
```

**Line 407-410**: Notes
```tsx
// FROM: mt-4 text-[14px] ... p-4
// TO: mt-3 text-[12px] ... p-3
```

**Line 415-420**: Last performance
```tsx
// FROM: mb-4 ... p-3 text-[14px]
// TO: mb-3 ... p-2 text-[13px]
```

**Line 424-448**: Inputs
```tsx
// FROM: space-y-3 mb-6
// TO: space-y-2 mb-4

// Label FROM: text-[12px] ... mb-1.5
// TO: text-[11px] ... mb-1

// Input FROM: px-4 py-3 ... text-[18px]
// TO: px-3 py-2.5 ... text-[16px]
```

**Line 461-482**: Buttons
```tsx
// Primary FROM: py-3 ... text-[14px]
// TO: py-3 ... text-[13px]

// Icon FROM: w-5 h-5
// TO: w-4 h-4

// Skip FROM: py-2.5 text-[13px]
// TO: py-2 text-[12px]
```

---

### **3. HomePage.tsx**

**Line 147**: Container
```tsx
// FROM: px-5 pt-6 ... mb-8
// TO: px-4 pt-4 ... mb-6
```

**Line 149-151**: Header
```tsx
// FROM: gap-2.5 mb-3
// TO: gap-2 mb-2

// Logo FROM: text-xl
// TO: text-lg
```

**Line 153-155**: Date
```tsx
// FROM: text-[11px] ... mb-2
// TO: text-[10px] ... mb-1
```

**Line 156**: Greeting
```tsx
// FROM: text-3xl (20px) ... mb-6
// TO: text-xl (14px) ... mb-4
```

**Line 159-162**: Stats
```tsx
// FROM: text-[13px] ... gap-5
// TO: text-[12px] ... gap-3
```

**Line 164**: Main spacing
```tsx
// FROM: space-y-6
// TO: space-y-4
```

**All GlassCard components**:
- Padding: p-5 → p-4
- Heading: text-2xl → text-xl
- Metrics: text-[13px] → text-[12px]
- Gaps: reduced by 33%

---

### **4. GoalTrackingPage.tsx**

**Overall**:
- Container: px-5 pt-6 → px-4 pt-4
- Headings: text-3xl → text-xl
- Cards: p-6 → p-4
- Stats: text-4xl → text-2xl
- Progress bars: Thinner
- PR cards: p-4 → p-3

---

### **5. PlanPage.tsx**

**Weekly cards**:
- Padding: p-4 → p-3
- Title: text-base → text-sm
- Meta: text-[11px] → text-[10px]

**Modal**:
- Padding: px-5 → px-4
- Content: Reduce all sizes 20%

---

### **6. ProfilePage.tsx**

**All sections**:
- Container: px-5 → px-4
- Cards: p-5 → p-4
- Headings: text-xl → text-lg
- Lists: More compact rows
- Gaps: space-y-6 → space-y-4

---

### **7. Components**

**RestTimer.tsx**:
- Circle: 60% smaller
- Text: text-7xl → text-5xl
- Buttons: More compact

**BlockCompletionScreen.tsx**:
- Icon: w-24 → w-16
- Text: Reduce all 25%
- Padding: Tighter

**VictoryScreen.tsx**:
- Trophy: w-24 → w-16
- Stats: text-3xl → text-2xl
- Cards: Compact grid

**Navbar.tsx**:
- Icons: w-5 → w-4
- Text: text-[10px] → text-[9px]
- Height: Reduce overall

---

## 🎯 Execution Order (Next Session)

1. **index.html** - Set foundation (15 min)
2. **SessionTracker.tsx** - Complete compact redesign (60 min)
3. **HomePage.tsx** - Reduce all sizes (30 min)
4. **GoalTrackingPage.tsx** - Compact (20 min)
5. **PlanPage.tsx** - Compact (20 min)
6. **ProfilePage.tsx** - Compact (20 min)
7. **Components** - Compact all (40 min)
8. **Test & Polish** - Final pass (30 min)

Total: ~4 hours systematic work

---

## 📱 Testing Targets

**iPhone 13 Mini**: 375px width
**iPhone 14/15**: 390px width
**iPhone 16 Pro Max**: 430px width

App must feel elegant on all three.

---

**Next session: Execute this plan systematically, component by component.**

**Current**: Too big, not mobile-optimized
**Target**: Compact, elegant, sophisticated, functional
