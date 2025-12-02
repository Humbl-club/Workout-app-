/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ───────────────────────────────────────────────────────────────
         FONT FAMILIES - Use CSS variable tokens
         ─────────────────────────────────────────────────────────────── */
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },

      /* ───────────────────────────────────────────────────────────────
         FONT SIZES - Match token scale
         ─────────────────────────────────────────────────────────────── */
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--leading-tight)' }],
        'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-tight)' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-snug)' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        'md': ['var(--text-md)', { lineHeight: 'var(--leading-normal)' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-snug)' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-tight)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-none)' }],
        'hero': ['var(--text-hero)', { lineHeight: 'var(--leading-none)' }],
      },

      /* ───────────────────────────────────────────────────────────────
         COLORS - Semantic tokens from CSS variables
         ─────────────────────────────────────────────────────────────── */
      colors: {
        // Backgrounds
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
          overlay: 'var(--bg-overlay)',
        },
        // Surfaces
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          hover: 'var(--surface-hover)',
          active: 'var(--surface-active)',
          disabled: 'var(--surface-disabled)',
        },
        // Text
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          inverse: 'var(--text-inverse)',
          'on-brand': 'var(--text-on-brand)',
        },
        // Brand
        brand: {
          DEFAULT: 'var(--brand-primary)',
          primary: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
          active: 'var(--brand-primary-active)',
          subtle: 'var(--brand-primary-subtle)',
          secondary: 'var(--brand-secondary)',
        },
        // Borders
        border: {
          DEFAULT: 'var(--border-default)',
          default: 'var(--border-default)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
          error: 'var(--border-error)',
          success: 'var(--border-success)',
        },
        // Status colors
        success: {
          DEFAULT: 'var(--status-success-bg)',
          bg: 'var(--status-success-bg)',
          text: 'var(--status-success-text)',
          subtle: 'var(--status-success-subtle)',
        },
        error: {
          DEFAULT: 'var(--status-error-bg)',
          bg: 'var(--status-error-bg)',
          text: 'var(--status-error-text)',
          subtle: 'var(--status-error-subtle)',
        },
        warning: {
          DEFAULT: 'var(--status-warning-bg)',
          bg: 'var(--status-warning-bg)',
          text: 'var(--status-warning-text)',
          subtle: 'var(--status-warning-subtle)',
        },
        info: {
          DEFAULT: 'var(--status-info-bg)',
          bg: 'var(--status-info-bg)',
          text: 'var(--status-info-text)',
          subtle: 'var(--status-info-subtle)',
        },
        // Workout-specific
        workout: {
          strength: 'var(--workout-strength)',
          'strength-subtle': 'var(--workout-strength-subtle)',
          cardio: 'var(--workout-cardio)',
          'cardio-subtle': 'var(--workout-cardio-subtle)',
          mobility: 'var(--workout-mobility)',
          'mobility-subtle': 'var(--workout-mobility-subtle)',
          rest: 'var(--workout-rest)',
          'rest-subtle': 'var(--workout-rest-subtle)',
          power: 'var(--workout-power)',
          'power-subtle': 'var(--workout-power-subtle)',
        },
        // Interactive states
        interactive: {
          hover: 'var(--interactive-hover)',
          active: 'var(--interactive-active)',
          selected: 'var(--interactive-selected)',
        },
      },

      /* ───────────────────────────────────────────────────────────────
         SPACING - Token-based spacing scale
         ─────────────────────────────────────────────────────────────── */
      spacing: {
        'px': 'var(--space-px)',
        '0': 'var(--space-0)',
        '0.5': 'var(--space-0-5)',
        '1': 'var(--space-1)',
        '1.5': 'var(--space-1-5)',
        '2': 'var(--space-2)',
        '2.5': 'var(--space-2-5)',
        '3': 'var(--space-3)',
        '3.5': 'var(--space-3-5)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '7': 'var(--space-7)',
        '8': 'var(--space-8)',
        '9': 'var(--space-9)',
        '10': 'var(--space-10)',
        '11': 'var(--space-11)',
        '12': 'var(--space-12)',
        '14': 'var(--space-14)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '28': 'var(--space-28)',
        '32': 'var(--space-32)',
        // Component-specific
        'card': 'var(--space-card-padding)',
        'card-lg': 'var(--space-card-padding-lg)',
        'section': 'var(--space-section-gap)',
        'page': 'var(--space-page-padding)',
        'page-lg': 'var(--space-page-padding-lg)',
        // Safe areas
        'safe-top': 'var(--safe-top)',
        'safe-bottom': 'var(--safe-bottom)',
        'safe-left': 'var(--safe-left)',
        'safe-right': 'var(--safe-right)',
        // Component heights
        'touch-min': 'var(--height-touch-min)',
        'button': 'var(--height-button)',
        'button-sm': 'var(--height-button-sm)',
        'button-lg': 'var(--height-button-lg)',
        'input': 'var(--height-input)',
        'input-sm': 'var(--height-input-sm)',
        'navbar': 'var(--height-navbar)',
        'navbar-total': 'var(--height-navbar-total)',
        'header': 'var(--height-header)',
      },

      /* ───────────────────────────────────────────────────────────────
         BORDER RADIUS - Token-based
         ─────────────────────────────────────────────────────────────── */
      borderRadius: {
        'none': 'var(--radius-none)',
        'xs': 'var(--radius-xs)',
        'sm': 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },

      /* ───────────────────────────────────────────────────────────────
         BOX SHADOW - Token-based
         ─────────────────────────────────────────────────────────────── */
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'glow-brand': 'var(--shadow-glow-brand)',
        'glow-success': 'var(--shadow-glow-success)',
        'glow-error': 'var(--shadow-glow-error)',
        'ring-focus': 'var(--ring-focus)',
        'ring-error': 'var(--ring-error)',
      },

      /* ───────────────────────────────────────────────────────────────
         Z-INDEX - Clear hierarchy
         ─────────────────────────────────────────────────────────────── */
      zIndex: {
        'base': 'var(--z-base)',
        'above': 'var(--z-above)',
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'overlay': 'var(--z-overlay)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'toast': 'var(--z-toast)',
        'max': 'var(--z-max)',
      },

      /* ───────────────────────────────────────────────────────────────
         TRANSITIONS - Token-based durations and easings
         ─────────────────────────────────────────────────────────────── */
      transitionDuration: {
        'instant': 'var(--duration-instant)',
        'fast': 'var(--duration-fast)',
        DEFAULT: 'var(--duration-normal)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'slower': 'var(--duration-slower)',
        'slowest': 'var(--duration-slowest)',
      },

      transitionTimingFunction: {
        DEFAULT: 'var(--ease-default)',
        'default': 'var(--ease-default)',
        'in': 'var(--ease-in)',
        'out': 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
        'spring': 'var(--ease-spring)',
        'bounce': 'var(--ease-bounce)',
        'smooth': 'var(--ease-smooth)',
      },

      /* ───────────────────────────────────────────────────────────────
         ANIMATIONS - Reference to CSS animations
         ─────────────────────────────────────────────────────────────── */
      animation: {
        'fade-in': 'fade-in var(--duration-normal) var(--ease-out)',
        'fade-in-up': 'fade-in-up var(--duration-normal) var(--ease-out)',
        'fade-in-down': 'fade-in-down var(--duration-normal) var(--ease-out)',
        'fade-in-scale': 'fade-in-scale var(--duration-fast) var(--ease-spring)',
        'slide-in-right': 'slide-in-right var(--duration-normal) var(--ease-out)',
        'slide-in-up': 'slide-in-up var(--duration-normal) var(--ease-out)',
        'scale-in': 'scale-in var(--duration-fast) var(--ease-spring)',
        'page-enter': 'page-enter var(--duration-slow) var(--ease-out)',
        'spin': 'spin var(--duration-slowest) linear infinite',
        'pulse': 'pulse 2s var(--ease-in-out) infinite',
        'pulse-subtle': 'pulse-subtle 3s var(--ease-in-out) infinite',
        'bounce-subtle': 'bounce-subtle 2s var(--ease-in-out) infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'breathe': 'breathe 2s var(--ease-in-out) infinite',
      },

      /* ───────────────────────────────────────────────────────────────
         MIN/MAX WIDTHS - iPhone screen sizes
         ─────────────────────────────────────────────────────────────── */
      maxWidth: {
        'screen-mini': 'var(--screen-mini)',
        'screen-standard': 'var(--screen-standard)',
        'screen-pro': 'var(--screen-pro)',
        'screen-plus': 'var(--screen-plus)',
        'screen-max': 'var(--screen-max)',
      },

      minWidth: {
        'touch': 'var(--height-touch-min)',
      },

      minHeight: {
        'touch': 'var(--height-touch-min)',
        'button': 'var(--height-button)',
        'input': 'var(--height-input)',
      },

      height: {
        'touch-min': 'var(--height-touch-min)',
        'button': 'var(--height-button)',
        'button-sm': 'var(--height-button-sm)',
        'button-lg': 'var(--height-button-lg)',
        'input': 'var(--height-input)',
        'input-sm': 'var(--height-input-sm)',
        'navbar': 'var(--height-navbar)',
        'header': 'var(--height-header)',
      },
    },
  },
  plugins: [],
}
