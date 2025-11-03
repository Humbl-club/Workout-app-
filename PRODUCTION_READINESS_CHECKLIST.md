# REBLD - Production Readiness Checklist

**Status**: 🟡 Final Testing Phase
**Date**: November 1, 2025
**Version**: 1.0.0

---

## ✅ Completed Features

### **Core Functionality**
- [x] User authentication (Firebase Auth)
- [x] Plan generation (Gemini 2.5-pro)
- [x] Plan parsing (simple → complex)
- [x] Workout tracking (card stack interface)
- [x] Superset support (auto-advance A1→A2)
- [x] AMRAP mode
- [x] Block completion celebrations
- [x] Victory screen with confetti
- [x] PR detection (automatic)
- [x] Goal tracking (progress bars)
- [x] Profile management (body metrics)
- [x] Weekly plan overview
- [x] Rest timer (circular progress)

### **UI/UX**
- [x] Midnight Energy theme (red accents)
- [x] Mobile-first design
- [x] iPhone 16 optimizations
- [x] 48px+ touch targets
- [x] Simplified HomePage
- [x] Fixed Plan popup (X button, 92vh height)
- [x] Goals page (elegant, not goofy)
- [x] Profile page (body metrics, settings)
- [x] Navigation (Home|Goals|Plan|Profile)

### **AI Integration**
- [x] Gemini 2.5-pro & flash
- [x] Enhanced parsing (supersets, AMRAP, giant sets)
- [x] AI chat assistant
- [x] Exercise explanation framework
- [x] Caching infrastructure

### **Cost Optimization**
- [x] Caching service (services/cacheService.ts)
- [x] Gemini Ultra population guide
- [x] Exercise database structure
- [x] Plan template framework

---

## 🧪 Testing Checklist

### **Step 1: Basic Flow** ⭐ CRITICAL
- [ ] Open app → See HomePage
- [ ] Dark theme loads (Midnight Energy)
- [ ] "REBLD" logo visible (red accent)
- [ ] Streak counter shows
- [ ] Today's workout card displays

### **Step 2: Plan Parsing** ⭐ CRITICAL
- [ ] Go to Profile → "+ Create New Plan"
- [ ] Try AI-generated plan (select options)
- [ ] Try importing TEST_COMPLEX_PLAN.md
- [ ] **Verify workouts have exercises (not rest days!)**
- [ ] Check browser console for errors
- [ ] Confirm all 7 days created
- [ ] Verify supersets detected (A1/A2)
- [ ] Verify AMRAP blocks detected

### **Step 3: Workout Flow** ⭐ CRITICAL
- [ ] Start a workout from HomePage
- [ ] See PreWorkoutScreen (breathing circle)
- [ ] Equipment checklist optional
- [ ] Tap "Start Workout"
- [ ] See SessionTracker card stack
- [ ] Progress bar at top
- [ ] One exercise visible
- [ ] Enter weight/reps
- [ ] Tap "Complete Set"
- [ ] See rest timer (red circle)
- [ ] Complete all sets
- [ ] Move to next exercise
- [ ] **If superset**: Auto-advance A1→A2
- [ ] Complete workout
- [ ] See victory screen with confetti

### **Step 4: PR Detection** ⭐
- [ ] During workout, log a set heavier than before
- [ ] **See toast**: "🏆 NEW PR! Exercise - XXX lbs × X"
- [ ] Feel haptic feedback (on mobile)
- [ ] Go to Goals page after workout
- [ ] See PR in Personal Records section

### **Step 5: All Pages**
- [ ] **Home**: Simplified, clean, workout card prominent
- [ ] **Goals**: Progress bar, PRs listed
- [ ] **Plan**: Weekly overview, tap day → modal
- [ ] **Profile**: Account info, body metrics, create plan button

### **Step 6: Plan Page Specific**
- [ ] See all 7 days in weekly overview
- [ ] Today highlighted (red border)
- [ ] Tap any day → Modal opens
- [ ] **Modal has X button** (top right)
- [ ] Modal shows ~92% of screen
- [ ] See exercise blocks organized
- [ ] Tap "Start Workout" from modal
- [ ] Close modal (X or backdrop)

### **Step 7: Mobile Specific** 📱
- [ ] Test on mobile viewport (375px-430px)
- [ ] All text readable (no zoom needed)
- [ ] All buttons tappable (48px+)
- [ ] Navbar fits at bottom
- [ ] FAB button in thumb zone
- [ ] No horizontal scroll
- [ ] Smooth animations (60fps)

---

## 🐛 Known Issues to Verify Fixed

### **Issue 1: Parsing Marks Everything as Rest Days**
**Status**: 🔧 Fixed (added explicit parsing instructions)
**Test**: Import TEST_COMPLEX_PLAN.md
**Expected**: Day 1 has 4 blocks with exercises
**If fails**: Check console for error, share logs

### **Issue 2: Plan Popup Not Visible**
**Status**: ✅ Fixed (increased to 92vh, added X button)
**Test**: Tap day in Plan page
**Expected**: Modal shows 92% of screen with close button

### **Issue 3: HomePage Cluttered**
**Status**: ✅ Fixed (removed check-in, simplified rest day)
**Test**: View HomePage
**Expected**: Clean layout, only essential cards

### **Issue 4: No Plan Creation After Delete**
**Status**: ✅ Fixed (added button in Profile)
**Test**: Go to Profile → "+ Create New Plan"
**Expected**: Triggers onboarding flow

---

## 🚨 Critical Debugging Steps

### **If Parsing Still Fails:**

1. **Check Browser Console** (F12 → Console tab)
   - Look for: "Parsing plan with model..."
   - Check for errors
   - Share exact error message

2. **Verify API Key Loaded**
   - Check console for API key warnings
   - Confirm .env.local has uncommented key
   - **Restart dev server if needed**

3. **Try Simple Input First**
   - Instead of complex plan, try: "chest workout"
   - Should generate 3-4 chest exercises
   - If this works, complex parsing is the issue
   - If this fails, API key is the issue

4. **Check Network Tab**
   - Open DevTools → Network
   - Try parsing
   - Look for Gemini API call
   - Check if it's 401/403 (auth issue) or 400 (schema issue)

---

## 📊 Final Testing Matrix

| Feature | Simple Test | Complex Test | Mobile | Pass? |
|---------|-------------|--------------|--------|-------|
| **Plan Import** | "chest workout" | TEST_COMPLEX_PLAN.md | N/A | ⬜ |
| **Plan Display** | View in Plan page | View complex plan | ✓ | ⬜ |
| **Workout Start** | Simple workout | Superset workout | ✓ | ⬜ |
| **PR Detection** | Log heavier set | Multiple PRs | ✓ | ⬜ |
| **Goals Page** | View with 0 workouts | View with 20+ workouts | ✓ | ⬜ |
| **Profile** | Create new plan | View with data | ✓ | ⬜ |
| **Navigation** | All 4 tabs | Rapid switching | ✓ | ⬜ |

---

## 🔧 Post-Testing Action Items

### **If Tests Pass:**
1. ✅ Mark as production ready
2. ✅ Deploy to Firebase Hosting or Vercel
3. ✅ Share with 5-10 beta users
4. ✅ Start Gemini Ultra population this weekend

### **If Tests Fail:**
1. Document specific failures
2. Share error messages
3. I'll debug and fix
4. Retest until passing

---

## 💾 Gemini Ultra Population (This Weekend)

**After app testing passes:**

### **Saturday** (3 hours):
1. Generate 200 exercise explanations on gemini.google.com
2. Save as exercises.json
3. Upload to Firebase (I'll create script)

### **Sunday** (3 hours):
1. Extract book knowledge (3-5 books)
2. Create 10-15 plan templates
3. Upload to Firebase

**Result**: 60-70% API cost reduction

---

## 🚀 Production Deployment

**When ready:**
1. Build production bundle
2. Deploy to Vercel/Firebase Hosting
3. Configure environment variables
4. Test production build
5. Share beta link

**Estimated**: 1-2 hours

---

## 📋 Immediate Next Steps (Right Now)

1. **Restart dev server** (ensure API key loaded)
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Test simple parsing**:
   - Profile → Create New Plan → Import
   - Enter: "chest workout"
   - Click Parse
   - Check console for logs
   - Does it create a workout?

4. **Test complex parsing**:
   - Copy TEST_COMPLEX_PLAN.md
   - Import
   - Check console
   - Does Day 1 have exercises?

5. **Share results**:
   - What works?
   - What fails?
   - Console error messages?

Then we'll polish based on what you find!

Ready to test? 🎯