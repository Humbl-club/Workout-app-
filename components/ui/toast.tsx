import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   TOAST SYSTEM - Phase 9.3 Composite Components

   Notification system with multiple variants.
   Includes Toast, ToastContainer, and useToast hook.
   Auto-dismiss with configurable duration.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'

export interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────

interface ToastContextValue {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ─────────────────────────────────────────────────────────────
// TOAST PROVIDER
// ─────────────────────────────────────────────────────────────

interface ToastProviderProps {
  children: React.ReactNode
  /** Default duration in ms */
  defaultDuration?: number
  /** Maximum toasts shown at once */
  maxToasts?: number
  /** Position of toast container */
  position?: ToastPosition
}

export function ToastProvider({
  children,
  defaultDuration = 4000,
  maxToasts = 5,
  position = 'bottom',
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
    }

    setToasts((prev) => {
      const updated = [...prev, newToast]
      // Limit max toasts
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts)
      }
      return updated
    })

    return id
  }, [defaultDuration, maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer position={position} />
    </ToastContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// TOAST CONTAINER
// ─────────────────────────────────────────────────────────────

const positionStyles: Record<ToastPosition, string> = {
  'top': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'top-left': 'top-0 left-0 items-start',
  'top-right': 'top-0 right-0 items-end',
  'bottom': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-left': 'bottom-0 left-0 items-start',
  'bottom-right': 'bottom-0 right-0 items-end',
}

interface ToastContainerProps {
  position?: ToastPosition
}

function ToastContainer({ position = 'bottom' }: ToastContainerProps) {
  const { toasts, removeToast } = useToast()
  const isTop = position.startsWith('top')

  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        'fixed z-[var(--z-toast)]',
        'flex flex-col gap-[var(--space-2)]',
        'p-[var(--space-4)]',
        'pointer-events-none',
        // Safe area padding
        isTop
          ? 'pt-[max(var(--space-4),env(safe-area-inset-top))]'
          : 'pb-[max(var(--space-4),env(safe-area-inset-bottom))]',
        positionStyles[position]
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// TOAST COMPONENT
// ─────────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, { bg: string; icon: string; border: string }> = {
  default: {
    bg: 'bg-[var(--surface-primary)]',
    icon: 'text-[var(--text-primary)]',
    border: 'border-[var(--border-default)]',
  },
  success: {
    bg: 'bg-[var(--surface-primary)]',
    icon: 'text-[var(--status-success-bg)]',
    border: 'border-[var(--status-success-bg)]/30',
  },
  error: {
    bg: 'bg-[var(--surface-primary)]',
    icon: 'text-[var(--status-error-bg)]',
    border: 'border-[var(--status-error-bg)]/30',
  },
  warning: {
    bg: 'bg-[var(--surface-primary)]',
    icon: 'text-[var(--status-warning-bg)]',
    border: 'border-[var(--status-warning-bg)]/30',
  },
  info: {
    bg: 'bg-[var(--surface-primary)]',
    icon: 'text-[var(--status-info-bg)]',
    border: 'border-[var(--status-info-bg)]/30',
  },
}

interface ToastProps extends ToastData {
  onClose: () => void
}

function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 4000,
  action,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const styles = variantStyles[variant]

  // Auto-dismiss timer
  React.useEffect(() => {
    if (duration === 0) return

    const timer = setTimeout(() => {
      setIsExiting(true)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  // Handle exit animation
  React.useEffect(() => {
    if (!isExiting) return

    const timer = setTimeout(() => {
      onClose()
    }, 200) // Match animation duration

    return () => clearTimeout(timer)
  }, [isExiting, onClose])

  const handleClose = () => {
    setIsExiting(true)
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'pointer-events-auto',
        'w-full max-w-[360px]',
        'p-[var(--space-4)]',
        'rounded-[var(--radius-xl)]',
        'border',
        'shadow-[var(--shadow-lg)]',
        styles.bg,
        styles.border,
        // Animation
        isExiting
          ? 'animate-fade-out-scale'
          : 'animate-fade-in-scale',
        // Glass effect
        'backdrop-blur-sm'
      )}
    >
      <div className="flex gap-[var(--space-3)]">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
          <ToastIcon variant={variant} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p
              className={cn(
                'text-[var(--text-base)]',
                'font-[var(--weight-semibold)]',
                'text-[var(--text-primary)]',
                'leading-[var(--leading-tight)]'
              )}
            >
              {title}
            </p>
          )}
          {description && (
            <p
              className={cn(
                title && 'mt-[var(--space-1)]',
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'leading-[var(--leading-snug)]'
              )}
            >
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-[var(--space-2)]',
                'text-[var(--text-sm)]',
                'font-[var(--weight-semibold)]',
                'text-[var(--brand-primary)]',
                'hover:underline',
                'transition-colors duration-[var(--duration-fast)]'
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0',
            'w-6 h-6',
            'flex items-center justify-center',
            'rounded-full',
            'text-[var(--text-tertiary)]',
            'hover:bg-[var(--surface-hover)]',
            'hover:text-[var(--text-primary)]',
            'transition-all duration-[var(--duration-fast)]'
          )}
          aria-label="Dismiss notification"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = "w-5 h-5"

  switch (variant) {
    case 'success':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'error':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'warning':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    case 'info':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
  }
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/** Convenience functions for common toast types */
export const toast = {
  success: (title: string, description?: string) => ({
    title,
    description,
    variant: 'success' as const,
  }),
  error: (title: string, description?: string) => ({
    title,
    description,
    variant: 'error' as const,
  }),
  warning: (title: string, description?: string) => ({
    title,
    description,
    variant: 'warning' as const,
  }),
  info: (title: string, description?: string) => ({
    title,
    description,
    variant: 'info' as const,
  }),
}

export {
  Toast,
  ToastContainer,
}
