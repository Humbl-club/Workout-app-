# REBLD - Complete Testing Guide

**Status**: Web app feature complete ✅
**Ready for**: End-to-end testing

---

## 🚀 How to Start Testing

### **1. Restart Dev Server** (CRITICAL!)

The API key was just fixed, so you MUST restart:

```bash
# Stop current server (Ctrl+C or Cmd+C)
npm run dev
```

The server will now load the Gemini API key properly.

---

## 📋 Complete Feature Checklist

### **✅ Design System - Midnight Energy**
- [x] Dark navy background (#121418)
- [x] Red accent color (#FF3366)
- [x] Clean "REBLD" logo (Space Grotesk font)
- [x] Red glow effects on buttons
- [x] High contrast text
- [x] Consistent spacing (20px)
- [x] Mobile-optimized (48px+ touch targets)

### **✅ HomePage**
- [x] Clean header with REBLD logo
- [x] Streak counter
- [x] Today's workout card (red border + glow)
- [x] "Prepare to Start" button (red with glow)
- [x] Rest day with 3 options (Recovery/Generate/Just Rest)
- [x] Daily routine card
- [x] Question marks on exercises (coming soon)
- [x] Red AI FAB button

### **✅ PreWorkoutScreen**
- [x] Breathing circle (pulsing animation)
- [x] Workout overview
- [x] Equipment checklist (OPTIONAL - not blocking)
- [x] Session settings display
- [x] Last session stats
- [x] Red "Start Workout" button (always enabled)

### **✅ SessionTracker (Card Stack)**
- [x] Progress bar at top (red with glow)
- [x] ONE exercise at a time (card stack)
- [x] Large exercise title (48px)
- [x] Superset logic (A1 → A2 → rest → repeat)
- [x] Round counting for supersets
- [x] Set counting for single exercises
- [x] AMRAP mode screen
- [x] Block completion screen
- [x] Large weight/reps inputs (24px)
- [x] Auto-fill from last session
- [x] Red "Complete Set" button
- [x] Rest timer integration

### **✅ RestTimer**
- [x] Circular progress ring (red)
- [x] Red glow effect
- [x] Large countdown numbers
- [x] +15s button
- [x] Skip button (red)
- [x] Midnight Energy styling

### **✅ BlockCompletionScreen**
- [x] Celebration between blocks
- [x] Progress dots
- [x] Next block preview
- [x] Red "Continue Workout" button

### **✅ VictoryScreen**
- [x] Confetti animation
- [x] Trophy icon with red glow
- [x] Stats count-up animations
- [x] Duration, volume, exercises, sets
- [x] Share functionality
- [x] Red "Done" button

### **✅ DashboardPage**
- [x] Clean stat cards
- [x] Red bar chart
- [x] Key lift progression (red accents)
- [x] Midnight Energy theme

### **✅ PlanPage**
- [x] Plan switcher dropdown
- [x] Edit/Delete/Calendar buttons
- [x] Red accents
- [x] Midnight Energy theme

### **✅ LogbookPage**
- [x] Clean log cards
- [x] Exercise details
- [x] Red RPE indicators
- [x] Midnight Energy theme

### **✅ Enhanced AI Parsing**
- [x] Handles simple inputs ("chest today")
- [x] Handles complex supersets (A1/A2)
- [x] Handles giant sets (B1/B2/B3)
- [x] Handles AMRAP blocks
- [x] Distance notation (20m, 30m)
- [x] Rest timing logic (0s between, actual rest after)
- [x] RPE extraction
- [x] Daily Non-Negotiables
- [x] Drop sets, tempo, form cues

---

## 🧪 Test Scenarios

### **Test 1: Simple Workout Flow** ⭐

**Steps:**
1. Go to HomePage
2. Click "Prepare to Start" on workout card
3. See PreWorkoutScreen (breathing circle)
4. (Optional) Check equipment boxes
5. Click "Start Workout"
6. See SessionTracker card stack:
   - Progress bar at top
   - ONE exercise visible
   - Large inputs
7. Enter weight and reps
8. Click "Complete Set"
9. See rest timer (red circle)
10. After rest, continue to next set
11. Complete all sets
12. See next exercise
13. Complete workout
14. See VictoryScreen with confetti

**Expected Result:**
- ✅ Smooth flow, no errors
- ✅ Red accents throughout
- ✅ Confetti on completion
- ✅ Stats count up with animation

---

### **Test 2: Complex Plan Parsing** ⭐⭐⭐

**Steps:**
1. Open [TEST_COMPLEX_PLAN.md](TEST_COMPLEX_PLAN.md)
2. Copy entire content
3. In app, navigate to Plan page
4. Find option to import/create new plan
5. Paste the complex density training program
6. Click "Parse" or "Import"
7. Wait for AI to process

**Expected Result:**
- ✅ AI recognizes 7 days
- ✅ Daily Non-Negotiables extracted separately
- ✅ Day 1 has 4 blocks (A, B, C, D)
- ✅ Block A is a superset (2 exercises, 4 rounds)
- ✅ A1: 0s rest, A2: 2 min rest
- ✅ Block B is single exercise (4 sets)
- ✅ Block C is superset (4 rounds)
- ✅ Block D is superset (3 rounds)
- ✅ Day 4 Block D is AMRAP (10 min)
- ✅ All exercises have proper metrics

**Check Parsing:**
- View Day 1 in plan
- Verify "The Sled Gauntlet" is marked as superset
- Verify 4 rounds
- Verify rest timing (0s on A1, 120s on A2)

---

### **Test 3: Superset Workout** ⭐⭐

**Steps:**
1. Start Day 2 (Upper Body - has supersets)
2. Begin workout
3. Complete A1 (Bench Press) - enter weight/reps
4. Click "Next Exercise" (should auto-advance)
5. Immediately see A2 (Pallof Press) - NO rest timer
6. Complete A2
7. NOW see rest timer (90s)
8. After rest, should show A1 again (Round 2 of 5)
9. Complete all 5 rounds
10. See Block Completion screen
11. Continue to Block B (Giant Set with 3 exercises)

**Expected Result:**
- ✅ Auto-advances A1 → A2 (no rest)
- ✅ Rest after completing A1+A2
- ✅ Counts rounds (not sets)
- ✅ Shows "Round X of 5"
- ✅ Block completion celebration between blocks

---

### **Test 4: AMRAP Mode** ⭐⭐

**Steps:**
1. Start Day 4 (has AMRAP in Block D)
2. Complete exercises until you reach Block D
3. See AMRAP screen:
   - 10 minute timer
   - List of exercises (Sled Push, Backward Drag)
4. Timer should run
5. Complete AMRAP block
6. Continue to next day/finish

**Expected Result:**
- ✅ Shows AMRAP mode interface
- ✅ Lists exercises in the AMRAP
- ✅ Timer displays correctly
- ✅ Can complete block manually

---

### **Test 5: Victory Screen** ⭐

**Steps:**
1. Complete any full workout
2. See VictoryScreen

**Expected Result:**
- ✅ Confetti falls from top
- ✅ Trophy icon with red glow
- ✅ Stats count up (duration, volume, exercises, sets)
- ✅ Numbers animate from 0 → actual value
- ✅ Red "Done" button
- ✅ Share button works

---

### **Test 6: All Pages Navigation** ⭐

**Steps:**
1. Navigate through all 4 tabs:
   - Home (today's workout)
   - Dashboard (stats and charts)
   - Plan (weekly overview)
   - Logbook (workout history)

**Expected Result:**
- ✅ All pages use Midnight Energy theme
- ✅ Red accents throughout
- ✅ Navbar shows red on active page
- ✅ Consistent typography
- ✅ No visual glitches

---

## 🐛 Known Issues to Watch For

### **Potential Bugs:**

1. **API Key Not Working**
   - **Symptom**: "API key invalid" when importing plans
   - **Fix**: Did you restart the dev server?
   - **Check**: Look in browser console for errors

2. **Superset Auto-Advance**
   - **Symptom**: Doesn't move from A1 to A2 automatically
   - **Fix**: Check that A1 has `rest_period_s: 0`
   - **Test**: Complete A1, should immediately show A2

3. **Rest Timer**
   - **Symptom**: Doesn't appear after set
   - **Fix**: Check exercise has `rest_period_s > 0`
   - **Test**: Should show after completing set

4. **Block Completion**
   - **Symptom**: Doesn't show between blocks
   - **Fix**: Verify handleBlockComplete is called
   - **Test**: Should show after finishing Block A, before Block B

5. **Progress Bar**
   - **Symptom**: Doesn't move or shows wrong percentage
   - **Fix**: Check exercise counting logic
   - **Test**: Should show X/Y exercises

---

## 📊 Testing Metrics

### **What to Measure:**

**Performance:**
- [ ] Animations smooth (60fps)?
- [ ] No lag when logging sets?
- [ ] Page transitions smooth?
- [ ] Rest timer accurate?

**UX:**
- [ ] Can complete workout without confusion?
- [ ] Superset flow intuitive?
- [ ] Easy to enter weight/reps during workout?
- [ ] Progress bar helpful?

**Reliability:**
- [ ] AI parsing works on complex plans?
- [ ] No crashes during workout?
- [ ] Data saves correctly to Firebase?
- [ ] Rest timer doesn't skip?

---

## 🎯 Success Criteria

**Workout Flow Must Be:**
1. ✅ **Intuitive** - No thinking required
2. ✅ **Focused** - One exercise at a time
3. ✅ **Motivating** - Celebrations and progress
4. ✅ **Reliable** - Never loses data
5. ✅ **Fast** - No waiting, smooth animations

**Design Must Be:**
1. ✅ **Premium** - Midnight Energy theme
2. ✅ **Readable** - Large text, high contrast
3. ✅ **Accessible** - 48px+ touch targets
4. ✅ **Consistent** - Same patterns everywhere
5. ✅ **Beautiful** - Red accents, glows, animations

---

## 📝 Test Report Template

After testing, note:

**What Works:**
-

**What's Broken:**
-

**What's Confusing:**
-

**What's Missing:**
-

**Overall Feel:**
- Premium? (1-10)
- Easy to use? (1-10)
- Would use daily? (Yes/No)

---

## 🚀 Next Steps After Testing

### **If Everything Works:**
1. ✅ Deploy to production (Vercel/Firebase Hosting)
2. ✅ Share with 5-10 beta users
3. ✅ Collect feedback
4. ✅ Iterate based on real usage
5. ✅ Consider PWA conversion

### **If Issues Found:**
1. Document specific bugs
2. Prioritize critical vs nice-to-have
3. Fix critical bugs first
4. Polish and re-test

---

**Ready to test the complete REBLD experience!** 🔥🎯
