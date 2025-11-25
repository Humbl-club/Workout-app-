# 🚀 REBLD Version 1 - Feature Implementation Plan

**Goal:** Launch-ready app with core social & health features
**Timeline:** 6-8 weeks
**Priority:** High-value features for retention & growth

---

## ✅ VERSION 1 FEATURES (Launch Version)

### **1. Progress Photos** (1-2 weeks) ⭐⭐⭐⭐⭐
**Value:** Visual transformation proof

**Features:**
- Weekly photo capture (front, side, back)
- Before/after comparison view
- AI body composition estimation
- Progress timeline gallery
- Share photos to social media

**Schema:**
```typescript
progressPhotos: defineTable({
  userId: v.string(),
  photoUrl: v.string(),
  date: v.string(),
  bodyPart: v.union(v.literal("front"), v.literal("side"), v.literal("back")),
  aiAnalysis: v.optional(v.object({
    estimatedBodyFat: v.number(),
    muscleChanges: v.string(),
    improvements: v.array(v.string())
  }))
}).index("by_userId", ["userId"])
```

**Implementation:**
- Camera plugin (Capacitor)
- Image upload (Convex file storage or Cloudinary)
- Gemini Vision API for analysis (~$0.05 per photo)
- Comparison slider component

---

### **2. Apple Health Integration** (1 week) ⭐⭐⭐⭐⭐
**Value:** iOS ecosystem integration (REQUIRED)

**Features:**
- Auto-sync workouts to Apple Health
- Export: calories, duration, exercise types
- Read heart rate data (if available)
- Activity rings integration

**Implementation:**
```bash
npm install @capacitor-community/health
```

**Code:**
```typescript
// After workout completion
import { Health } from '@capacitor-community/health';

await Health.requestAuthorization();
await Health.writeWorkout({
  type: 'strength_training',
  duration: durationMinutes,
  calories: estimatedCalories,
  startDate: startTime,
  endDate: endTime
});
```

**No API costs, native iOS only**

---

### **3. Streaks & Achievements** (3-5 days) ⭐⭐⭐⭐⭐
**Value:** Gamification, retention

**Features:**
- Daily workout streak counter
- Achievement badges:
  - First workout
  - 7-day streak
  - 30-day streak
  - 100 workouts
  - 10,000kg total volume
  - 50 PRs
- Heat map calendar (GitHub-style)
- Streak freeze (1 per month for premium)

**Schema:**
```typescript
achievements: defineTable({
  userId: v.string(),
  type: v.string(), // "streak_7", "workouts_100", etc.
  unlockedAt: v.string(),
  displayName: v.string(),
  icon: v.string()
}).index("by_userId", ["userId"])
```

**UI:**
- Badge showcase on profile
- Popup when unlocking achievement
- Progress toward next achievement

**No API costs**

---

### **4. Nutrition Basics** (2-3 weeks) ⭐⭐⭐⭐
**Value:** Complete fitness solution

**Features:**
- Macro calculator (based on goals)
- Daily protein target
- Simple meal logging
- Macro progress bars
- Pre/post workout suggestions
- Water intake tracking

**Schema:**
```typescript
nutritionLogs: defineTable({
  userId: v.string(),
  date: v.string(),
  protein: v.number(),
  carbs: v.number(),
  fats: v.number(),
  calories: v.number(),
  meals: v.array(v.object({
    name: v.string(),
    protein: v.number(),
    time: v.string()
  }))
}).index("by_userId_date", ["userId", "date"])

nutritionTargets: defineTable({
  userId: v.string(),
  dailyProtein: v.number(),
  dailyCarbs: v.number(),
  dailyFats: v.number(),
  dailyCalories: v.number(),
  generatedAt: v.string()
}).index("by_userId", ["userId"])
```

**Implementation:**
- Macro calculator (TDEE formula)
- Simple food search (public nutrition DB)
- Quick-add common foods
- Daily summary dashboard

**No API costs (use public nutrition database)**

---

### **5. Social Features - Workout Buddies** (2-3 weeks) ⭐⭐⭐⭐⭐
**Value:** Accountability, competition, viral growth

**KEY FEATURES YOU REQUESTED:**

#### **A. Plan Sharing**
**Flow:**
1. User A clicks "Share Plan" on their plan
2. Generate share code or link
3. User B receives link/code
4. User B sees plan preview
5. User B chooses:
   - "Replace Current Plan" (replaces their active plan)
   - "Add as New Plan" (adds to their plan list)
   - "Decline"
6. Both users now have identical plan
7. Can enable comparison mode

**Schema:**
```typescript
sharedPlans: defineTable({
  shareCode: v.string(), // "REBLD-A1B2C3"
  planId: v.id("workoutPlans"),
  sharedBy: v.string(), // userId
  sharedWith: v.array(v.string()), // userIds
  createdAt: v.string(),
  expiresAt: v.string(), // 7 days
  acceptedBy: v.array(v.string()) // userIds who accepted
}).index("by_shareCode", ["shareCode"])

workoutBuddies: defineTable({
  userId: v.string(),
  buddyId: v.string(),
  sharedPlanId: v.id("workoutPlans"),
  comparisonEnabled: v.boolean(),
  createdAt: v.string(),
  status: v.union(v.literal("active"), v.literal("paused"))
}).index("by_userId", ["userId"])
  .index("by_buddyPair", ["userId", "buddyId"])
```

#### **B. PR Comparison**
**Features:**
- See buddy's PRs next to yours
- Visual comparison (you vs them)
- Leaderboard for each exercise
- Friendly competition

**UI:**
```tsx
<Card className="mb-4">
  <CardHeader>
    <h3>Squat - PR Comparison</h3>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-sm text-muted">You</p>
        <p className="text-3xl font-black text-primary">120kg</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-muted">Alex</p>
        <p className="text-3xl font-black text-accent">135kg</p>
      </div>
    </div>
    <p className="text-xs text-center mt-2 text-tertiary">
      You're 15kg behind! 💪
    </p>
  </CardContent>
</Card>
```

#### **C. Live Workout Notifications**
**Flow:**
1. User A starts workout
2. System checks if User B is a workout buddy
3. If notifications enabled, send push notification:
   - "Alex just started their workout! Time to train? 💪"
4. User B can:
   - Start their workout (accountability!)
   - Snooze notification
   - Send motivational message

**Schema:**
```typescript
buddyNotifications: defineTable({
  userId: v.string(), // recipient
  triggeredBy: v.string(), // buddy who started workout
  type: v.literal("workout_started"),
  createdAt: v.string(),
  read: v.boolean()
}).index("by_userId", ["userId"])

buddySettings: defineTable({
  userId: v.string(),
  buddyId: v.string(),
  notifyOnWorkoutStart: v.boolean(),
  compareStats: v.boolean(),
  shareLogs: v.boolean()
}).index("by_userId", ["userId"])
```

#### **D. Workout Log Sharing (Optional)**
**Features:**
- Enable "Share my workouts" with buddy
- Buddy sees your recent workouts
- Buddy sees your logged sets/reps
- Mutual motivation
- Privacy controls (can disable anytime)

**Implementation:**
- Permission system
- Privacy toggle in settings
- Shared workout feed

---

## 🎯 VERSION 1 IMPLEMENTATION ORDER

### **Phase 1: Foundation (Week 1-2)**
1. Apple Health integration (1 week)
2. Streaks & achievements (3-5 days)

**Deliverable:** iOS-ready app with gamification

---

### **Phase 2: Visual Progress (Week 3-4)**
3. Progress photos (1-2 weeks)

**Deliverable:** Transformation tracking

---

### **Phase 3: Social (Week 5-7)**
4. Plan sharing system (1 week)
5. Workout buddies & PR comparison (1 week)
6. Live notifications (3-5 days)

**Deliverable:** Social accountability features

---

### **Phase 4: Nutrition (Week 8-9)**
7. Nutrition basics (2-3 weeks)

**Deliverable:** Complete fitness solution

---

## 💰 COST IMPACT

### **New API Costs:**
- Progress photo analysis: ~$0.05 per photo (monthly)
- Nutrition calculations: Free (formula-based)
- Social features: Free (database only)
- Apple Health: Free (native)
- Achievements: Free (database only)

**Additional Monthly Cost Per User:** ~$0.08
**Still maintaining 90%+ margins!** ✅

---

## 📊 SCHEMA ADDITIONS NEEDED

```typescript
// Add to schema.ts

progressPhotos: defineTable({...}),
achievements: defineTable({...}),
nutritionLogs: defineTable({...}),
nutritionTargets: defineTable({...}),
sharedPlans: defineTable({...}),
workoutBuddies: defineTable({...}),
buddyNotifications: defineTable({...}),
buddySettings: defineTable({...})
```

**8 new tables total**

---

## 🚀 VERSION 1 LAUNCH READINESS

**Timeline:** 8-9 weeks from now
**Features:** Current 32 + 7 new = 39 features
**Value:** $20-30/month equivalent
**Pricing:** $12.99/month justified

**Competitive Position:** Market leader

---

**This Version 1 will be a complete fitness & social platform!** 💪
