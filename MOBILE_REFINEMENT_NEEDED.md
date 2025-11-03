# REBLD - Mobile Refinement Action Plan

**Current Status**: Feature-complete but NOT mobile-optimized
**Problem**: Everything is too big, spacing is off, not elegant for iPhone
**Priority**: HIGH - Fix before launch

---

## 🚨 Critical Issues to Fix

### **1. Typography Too Large**
**Current sizes**: 15-48px range
**Target sizes**: 12-24px range

**Changes needed:**
- H1: 28px → 20px
- H2: 22px → 18px
- Body: 15px → 14px
- Small: 13px → 12px
- Tiny: 11px → 10px

### **2. Spacing Too Generous**
**Current**: 20-24px padding, 20-24px gaps
**Target**: 12-16px padding, 12px gaps

**Changes needed:**
- Card padding: 24px → 16px
- Between cards: 24px → 12px
- Section gaps: 32px → 16px
- Header margin: 32px → 20px

### **3. Buttons Too Large**
**Current**: 56-60px height
**Target**: 44-48px height (still accessible)

### **4. Icons Too Big**
**Current**: 20-28px
**Target**: 16-20px

### **5. Border Radius Too Rounded**
**Current**: 12-16px (rounded-xl)
**Target**: 6-8px (rounded-lg)

---

## 📱 Mobile-First Redesign Checklist

### **Files to Update** (In Order):

**1. index.html** (Base styles)
- Reduce body font: 15px → 14px
- Mobile breakpoint sizes smaller
- Line height: 1.6 → 1.4
- Remove gradient utilities (not needed)

**2. HomePage.tsx**
- Logo: Smaller text
- Greeting: 28px → 20px
- Cards: 20px padding → 16px
- Buttons: Reduce height
- Spacing: Tighter gaps

**3. SessionTracker.tsx** (WORST OFFENDER)
- Exercise name: 48px → 24px
- Progress bar: Thinner
- Inputs: Smaller (not 24px)
- Buttons: 56px → 48px
- Overall: MUCH more compact

**4. GoalTrackingPage.tsx**
- Stat cards: Compact
- Progress bars: Thinner
- PR cards: Tighter layout

**5. PlanPage.tsx**
- Weekly overview: More compact cards
- Day cards: Less padding
- Modal: Better use of space

**6. ProfilePage.tsx**
- Compact layout
- Smaller metric cards
- Tighter sections

**7. components/RestTimer.tsx**
- Smaller circle
- Compact layout

**8. components/BlockCompletionScreen.tsx**
- Reduce all sizes
- Tighter layout

**9. components/VictoryScreen.tsx**
- Compact stat cards
- Smaller confetti
- Efficient layout

**10. components/layout/Navbar.tsx**
- Smaller icons
- Compact height
- Tighter spacing

---

## 🎨 New Size System (Mobile-First)

```css
/* Typography Scale - COMPACT */
--text-xs: 10px
--text-sm: 12px
--text-base: 14px
--text-lg: 16px
--text-xl: 18px
--text-2xl: 20px
--text-3xl: 24px

/* Spacing Scale - TIGHT */
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px

/* Component Sizes - REFINED */
Button height: 44-48px
Card padding: 16px
Card gaps: 12px
Icons: 16-20px
Border radius: 6-8px
```

---

## 🎯 SessionTracker Specific Fixes

**Current (Too Big)**:
```
Exercise name: 48px
Metrics: 14px
Inputs: 24px numbers
Buttons: 60px height
Padding: 32px
```

**Target (Elegant)**:
```
Exercise name: 24px
Metrics: 12px
Inputs: 18px numbers
Buttons: 48px height
Padding: 16px
```

---

## ✅ What Should Stay

- Midnight Energy color theme (works well)
- Red accent (#FF3366)
- Dark background
- Basic layout structure
- Navigation concept (Home/Goals/Plan/Profile)
- Feature set (goals, PRs, etc.)

## ❌ What Should Go

- Oversized text
- Excessive padding
- Giant buttons
- Huge icons
- Wasted whitespace
- Gradient utilities (unused)
- PreWorkoutScreen (removed)

---

## 🚀 Implementation Steps

### **Session 1** (1 hour): Base Styles
- Fix index.html typography scales
- Update spacing variables
- Set max-width to 640px globally

### **Session 2** (1 hour): Core Pages
- Fix HomePage sizing
- Fix SessionTracker (most critical)
- Fix navbar

### **Session 3** (1 hour): Secondary Pages
- Fix Goals, Plan, Profile pages
- Consistency pass
- Alignment fixes

### **Session 4** (30 min): Polish
- Test on 375px, 390px, 430px viewports
- Fine-tune spacing
- Final alignment

---

## 📊 Before/After Target

| Element | Current | Target |
|---------|---------|--------|
| Page heading | 32px | 20px |
| Card heading | 24px | 18px |
| Body text | 15px | 14px |
| Small text | 13px | 12px |
| Card padding | 24px | 16px |
| Card gaps | 24px | 12px |
| Button height | 60px | 48px |
| Icons | 24px | 18px |
| Border radius | 12px | 8px |

---

## 🎯 Success Criteria

**After refinement, the app should:**
- Feel elegant on iPhone (not bloated)
- Show more content per screen
- Be easier to scan
- Look sophisticated (not oversized)
- Still be fully accessible (48px touch targets)
- Work perfectly on iPhone 14-16 range

---

**Ready to execute systematic mobile refinement in next session.**

**Current session at 509K/1M tokens - saving remaining work for fresh start.**
