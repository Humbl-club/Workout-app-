# REBLD Design System - Nordic Minimalism

## Philosophy
Inspired by Norwegian running clubs and ALO Yoga × Vogue aesthetic:
- Clean, Scandinavian minimalism
- Premium, fashion-forward
- Intuitive and mobile-first
- Breathing room and whitespace

## Color Palette

### Primary Colors
```css
--background-primary: #FAFAF8   /* Warm off-white */
--background-secondary: #F5F5F3 /* Slightly darker off-white */
--background-tertiary: #FFFFFF  /* Pure white for cards */

--primary: #7A9D8D             /* Muted sage green */
--primary-hover: #6A8D7D       /* Darker sage */
--primary-light: #E8F0ED       /* Light sage background */

--accent: #C9997D              /* Warm terracotta */
--accent-hover: #B8886C        /* Darker terracotta */
--accent-light: #F4EDE7        /* Light terracotta background */

--text-primary: #2C2C2C        /* Deep charcoal */
--text-secondary: #6B6B6B      /* Warm gray */
--text-tertiary: #9E9E9E       /* Light gray */

--border: #ECECEA              /* Ultra-subtle borders */
--border-strong: #D4D4D2       /* Visible borders */

--success: #7A9D8D             /* Sage green */
--error: #C97D7D               /* Muted red */
--warning: #C9997D             /* Terracotta */
```

### Usage
- **Backgrounds**: Use warm off-white as base, white for cards
- **Actions**: Primary (sage) for main actions, accent (terracotta) for secondary
- **Text**: Deep charcoal for primary, warm gray for secondary
- **Borders**: Minimal and subtle

## Typography

### Font Stack
```css
--font-body: 'Manrope', system-ui, -apple-system, sans-serif;
--font-display: 'Syne', system-ui, sans-serif;
```

### Scale (Mobile-First)
```css
--text-xs: 13px      /* Small labels, minimum readable size */
--text-sm: 14px      /* Secondary text */
--text-base: 16px    /* Body text, DEFAULT */
--text-lg: 18px      /* Emphasized text */
--text-xl: 20px      /* Small headings */
--text-2xl: 24px     /* Section headings */
--text-3xl: 30px     /* Page headings */
--text-4xl: 36px     /* Hero text */
```

### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
--font-extrabold: 800
```

### Line Heights
```css
--leading-tight: 1.2
--leading-normal: 1.5
--leading-relaxed: 1.75
```

## Spacing

### Scale (8px base)
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

## Border Radius

```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 20px
--radius-2xl: 24px
--radius-full: 9999px
```

## Shadows

Soft, subtle shadows only:

```css
--shadow-sm: 0 1px 2px rgba(44, 44, 44, 0.04);
--shadow-md: 0 2px 8px rgba(44, 44, 44, 0.06);
--shadow-lg: 0 4px 16px rgba(44, 44, 44, 0.08);
--shadow-xl: 0 8px 32px rgba(44, 44, 44, 0.10);
```

## Components

### Buttons

**Primary Button**
```css
background: var(--primary);
color: white;
padding: 14px 24px;
border-radius: var(--radius-full);
font-size: var(--text-base);
font-weight: var(--font-semibold);
min-height: 48px; /* Touch target */
```

**Secondary Button**
```css
background: var(--accent);
color: white;
/* Same sizing as primary */
```

**Ghost Button**
```css
background: transparent;
color: var(--text-primary);
border: 1px solid var(--border-strong);
/* Same sizing */
```

### Cards

```css
background: white;
border: 1px solid var(--border);
border-radius: var(--radius-2xl);
padding: var(--space-6);
box-shadow: var(--shadow-sm);
```

### Input Fields

```css
background: white;
border: 2px solid var(--border);
border-radius: var(--radius-lg);
padding: 12px 16px;
font-size: var(--text-base);
min-height: 48px;

/* Focus state */
border-color: var(--primary);
outline: 2px solid var(--primary-light);
```

### Pills/Tags

```css
background: var(--primary-light);
color: var(--primary);
padding: 6px 12px;
border-radius: var(--radius-full);
font-size: var(--text-sm);
font-weight: var(--font-medium);
```

## Mobile Optimization

### Touch Targets
- Minimum 48px height for all interactive elements
- Minimum 44px width for buttons
- 8px minimum spacing between touch targets

### Safe Areas
```css
padding-bottom: calc(16px + env(safe-area-inset-bottom));
```

### Responsive Breakpoints
```css
--screen-sm: 640px
--screen-md: 768px
--screen-lg: 1024px
```

## Animations

Keep animations subtle and purposeful:

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

## Accessibility

- Minimum contrast ratio: 4.5:1 for normal text
- 3:1 for large text (18px+)
- Focus indicators on all interactive elements
- Semantic HTML
- ARIA labels where needed

## Layout Principles

1. **Whitespace First**: Let content breathe
2. **Visual Hierarchy**: Clear distinction between primary/secondary/tertiary
3. **Alignment**: Consistent left alignment for text
4. **Grouping**: Related items close together, unrelated items further apart
5. **Mobile First**: Design for small screens, enhance for larger

## Examples

### Good ✅
- Large, readable text (16px minimum)
- Clear visual hierarchy
- Generous whitespace
- Subtle borders and shadows
- One primary action per screen

### Bad ❌
- Text smaller than 13px
- Glassmorphism effects (backdrop-blur)
- Heavy drop shadows
- Multiple competing primary actions
- Dense information without breathing room
