# REBLD - Midnight Energy Design System

**Aesthetic**: Volt Athletics × Dark Mode × Electric Energy
**Vibe**: Bold, Athletic, High-Performance, Gen Z

---

## 🎨 Color Palette

### Backgrounds (Dark Slate)
```
#121418  ──────  Main background (deep navy/charcoal)
#1C1F26  ──────  Cards/elevated surfaces
#252930  ──────  Secondary surfaces
#2D323B  ──────  Hover states
```

### Text (High Contrast)
```
#F8F9FA  ──────  Primary text (off-white, easy on eyes)
#ADB5BD  ──────  Secondary text (light gray)
#6C757D  ──────  Tertiary text (medium gray)
```

### Electric Accents (Multi-Color System)
```
#00E5FF  ━━━━━━  PRIMARY: Electric Cyan (default, cardio)
#FF3366  ━━━━━━  SECONDARY: Hot Pink (AI, strength)
#FFD700  ━━━━━━  TERTIARY: Electric Gold (mobility, achievements)
```

### Status Colors
```
#00E5A0  ✓✓✓✓✓✓  Success (electric mint)
#FF4655  ✗✗✗✗✗✗  Error (bright red)
#FFB800  ⚠⚠⚠⚠⚠⚠  Warning (bright orange)
```

---

## ✨ Key Features

### 1. **Multi-Color Context System**

Different workout types get different accent colors:

- **Strength Training** → Hot Pink (#FF3366)
- **Cardio** → Electric Cyan (#00E5FF)
- **Mobility/Recovery** → Electric Gold (#FFD700)

Example:
```
🏋️ Upper Body Strength
[Hot Pink Button: Start]

🏃 Cardio Session
[Electric Cyan Button: Start]

🧘 Mobility Work
[Gold Button: Start]
```

### 2. **Glow Effects**

Electric colors have subtle glow:
```css
--glow-cyan: 0 0 20px rgba(0, 229, 255, 0.3)
--glow-pink: 0 0 20px rgba(255, 51, 102, 0.3)
--glow-gold: 0 0 20px rgba(255, 215, 0, 0.3)
```

Used on:
- Primary action buttons
- Logo
- FAB button (AI chat)
- Active progress indicators

### 3. **Typography**

- **Base size**: 15px (Apple standard)
- **Headlines**: Light weight (300) for sophistication
- **Body**: Normal (400) for readability
- **Buttons**: Semibold (600) for clarity

### 4. **Shapes**

- **Less rounded**: Max 16px border radius (12px standard)
- **Clean cards**: Subtle shadows, no heavy borders
- **Minimal chrome**: Let content breathe

---

## 📱 Component Showcase

### HomePage

```
┌─────────────────────────────────────┐
│ 🌈 [Gradient Logo Box]  [Sign Out] │ ← Cyan→Pink gradient
│ Good morning                         │ ← Large, light weight
│ Wednesday, January 31                │ ← Small, gray
│ 7 day streak · 18 workouts          │ ← Tiny, tertiary
│                                      │
├─────────────────────────────────────┤
│                                      │
│ UPPER BODY STRENGTH                  │ ← Card with dark surface
│ Push Focus                           │
│ 45 min · 6 exercises                 │
│                                      │
│ [Electric Cyan Button: Prepare]     │ ← Glowing cyan
│                                      │
├─────────────────────────────────────┤
│                                      │
│ DAILY ROUTINE                        │
│ [Button: Begin Workout]             │
│                                      │
└─────────────────────────────────────┘
      🎀 [Hot Pink FAB]  ← AI Chat (bottom right)
```

### PreWorkoutScreen

```
┌─────────────────────────────────────┐
│ Prepare to Train              ✕     │
│                                      │
│     🌈 [Gradient Circle]            │ ← Cyan→Pink, pulsing
│     Take a moment to prepare        │
│                                      │
│ ╔═══════════════════════════════╗  │
│ ║ UPPER BODY STRENGTH           ║  │ ← Dark card
│ ║ 45 min · 6 exercises          ║  │
│ ╚═══════════════════════════════╝  │
│                                      │
│ ╔═══════════════════════════════╗  │
│ ║ Equipment                     ║  │
│ ║ ✓ Dumbbells (checked, mint)   ║  │
│ ║ □ Bench                       ║  │
│ ╚═══════════════════════════════╝  │
│                                      │
│ ╔═══════════════════════════════╗  │
│ ║ 💎 Last Session               ║  │ ← Cyan glow
│ ║ 4,200 lbs · Try to beat it!   ║  │
│ ╚═══════════════════════════════╝  │
│                                      │
│ [Cyan Glowing Button: Start]        │
│ [Ghost Button: Maybe Later]         │
└─────────────────────────────────────┘
```

### Color Usage Examples

**Primary Actions**: Electric Cyan (#00E5FF)
```tsx
<button className="bg-[var(--accent)]">Start Workout</button>
// Glows with cyan
```

**AI/Magic Features**: Hot Pink (#FF3366)
```tsx
<button className="bg-[var(--accent-secondary)]">
  <SparklesIcon /> Ask AI
</button>
// Glows with pink
```

**Achievements/Recovery**: Electric Gold (#FFD700)
```tsx
<CoffeeIcon className="text-[var(--accent-mobility)]" />
// Used for rest days, achievements
```

---

## 🌟 What Makes It Premium

### 1. Electric Glow Effects
- Buttons aren't just colored - they GLOW
- Subtle neon effect
- Athletic, high-energy

### 2. Multi-Color Intelligence
- Not one-color-fits-all
- Context-aware accent usage
- Sophisticated color system

### 3. Dark But Not Black
- #121418 background (warm dark, not pure black)
- #F8F9FA text (off-white, not pure white)
- Easy on eyes during workouts

### 4. High Contrast
- Easy to read during exercise
- Clear hierarchy
- No squinting at tiny text

---

## 🎯 Updated Components

✅ **index.html** - Midnight Energy CSS variables
✅ **HomePage** - Electric cyan buttons with glow
✅ **PreWorkoutScreen** - Gradient breathing circle, cyan glow
✅ **Navbar** - Dark with electric cyan active states
✅ **App.tsx** - Hot pink FAB button
✅ **Metric Tags** - Dark surface backgrounds

---

## 🚀 Test It Now!

```bash
npm run dev
```

### What You'll See:

**Colors:**
- 🌃 Deep navy/charcoal background
- ⚡ Electric cyan primary buttons (with glow!)
- 🎀 Hot pink AI chat button
- 🌈 Cyan→Pink gradient logo
- ✨ Electric mint success states

**Feel:**
- Bold, athletic
- High-energy
- Volt Athletics vibes
- Gen Z approved
- Premium dark mode

**Key Elements:**
1. Logo: Gradient cyan→pink with glow
2. Main button: Electric cyan with subtle glow
3. AI FAB: Hot pink with pink glow
4. Rest day icon: Gold (recovery color)
5. Success checkmarks: Electric mint
6. Error states: Bright red

---

## 🎨 Design Philosophy

**Not**: Soft, cozy, wellness
**Yes**: Bold, athletic, high-performance

**Inspiration:**
- Volt Athletics (multi-color energy)
- Nike Training Club (dark mode, bold)
- Peloton (premium dark UI)
- Future App (sophisticated tech)

**Feels like:** A premium gym at 5am when the serious athletes train. High energy, no BS, pure performance.

---

**Next**: Test in browser and see the electric energy! ⚡
