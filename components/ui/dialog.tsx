import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   DIALOG COMPOSITE - Phase 9.3 Composite Components

   Modal dialog system with multiple variants.
   Includes standard Dialog and mobile BottomSheet.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// DIALOG ROOT
// ─────────────────────────────────────────────────────────────

interface DialogProps {
  /** Open state */
  open: boolean
  /** Change handler */
  onOpenChange: (open: boolean) => void
  /** Close on backdrop click */
  closeOnBackdrop?: boolean
  /** Close on escape key */
  closeOnEscape?: boolean
  /** Children */
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  closeOnBackdrop = true,
  closeOnEscape = true,
  children
}) => {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeOnEscape, onOpenChange])

  if (!open) return null

  return (
    <div
      className={cn(
        'fixed inset-0',
        'z-[var(--z-modal)]'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0',
          'bg-[var(--bg-overlay)]',
          'animate-fade-in'
        )}
        onClick={closeOnBackdrop ? () => onOpenChange(false) : undefined}
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// DIALOG CONTENT
// ─────────────────────────────────────────────────────────────

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Size variant */
  size?: DialogSize
  /** Show close button */
  showClose?: boolean
  /** Close handler */
  onClose?: () => void
  /** Children */
  children: React.ReactNode
}

const sizeStyles: Record<DialogSize, string> = {
  sm: 'max-w-[340px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[800px]',
  full: 'max-w-[calc(100%-var(--space-8))]',
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({
    className,
    children,
    size = 'md',
    showClose = true,
    onClose,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Positioning
          'fixed left-1/2 top-1/2',
          '-translate-x-1/2 -translate-y-1/2',
          // Size
          'w-full p-[var(--space-4)]',
          sizeStyles[size],
          // Z-index
          'z-[var(--z-modal)]'
        )}
        {...props}
      >
        <div
          className={cn(
            // Background
            'bg-[var(--surface-primary)]',
            'border border-[var(--border-default)]',
            // Shape
            'rounded-[var(--radius-2xl)]',
            // Shadow
            'shadow-[var(--shadow-xl)]',
            // Animation
            'animate-fade-in-scale',
            className
          )}
        >
          {showClose && onClose && (
            <button
              onClick={onClose}
              className={cn(
                'absolute top-[var(--space-4)] right-[var(--space-4)]',
                'w-[var(--height-button-sm)] h-[var(--height-button-sm)]',
                'rounded-full',
                'flex items-center justify-center',
                'text-[var(--text-secondary)]',
                'hover:bg-[var(--surface-hover)]',
                'hover:text-[var(--text-primary)]',
                'transition-all duration-[var(--duration-fast)]',
                'z-[var(--z-above)]'
              )}
              aria-label="Close dialog"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

// ─────────────────────────────────────────────────────────────
// DIALOG HEADER
// ─────────────────────────────────────────────────────────────

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-[var(--space-6)]',
      'pb-[var(--space-4)]',
      'border-b border-[var(--border-subtle)]',
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

// ─────────────────────────────────────────────────────────────
// DIALOG TITLE
// ─────────────────────────────────────────────────────────────

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-[var(--text-lg)]',
      'font-[var(--weight-bold)]',
      'text-[var(--text-primary)]',
      'leading-[var(--leading-tight)]',
      'pr-[var(--space-10)]', // Space for close button
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

// ─────────────────────────────────────────────────────────────
// DIALOG DESCRIPTION
// ─────────────────────────────────────────────────────────────

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'mt-[var(--space-1-5)]',
      'text-[var(--text-sm)]',
      'text-[var(--text-secondary)]',
      'leading-[var(--leading-snug)]',
      className
    )}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

// ─────────────────────────────────────────────────────────────
// DIALOG BODY
// ─────────────────────────────────────────────────────────────

const DialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-[var(--space-6)]',
      // Scrollable if content overflows
      'max-h-[60vh]',
      'overflow-y-auto',
      '-webkit-overflow-scrolling-touch',
      className
    )}
    {...props}
  />
))
DialogBody.displayName = "DialogBody"

// ─────────────────────────────────────────────────────────────
// DIALOG FOOTER
// ─────────────────────────────────────────────────────────────

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-[var(--space-6)]',
      'pt-[var(--space-4)]',
      'border-t border-[var(--border-subtle)]',
      'flex items-center justify-end',
      'gap-[var(--space-3)]',
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

// ─────────────────────────────────────────────────────────────
// BOTTOM SHEET (Mobile-first modal)
// ─────────────────────────────────────────────────────────────

interface BottomSheetProps {
  /** Open state */
  open: boolean
  /** Change handler */
  onOpenChange: (open: boolean) => void
  /** Height variant */
  height?: 'auto' | 'half' | 'full'
  /** Show drag handle */
  showHandle?: boolean
  /** Children */
  children: React.ReactNode
}

const heightStyles: Record<string, string> = {
  auto: '',
  half: 'min-h-[50vh]',
  full: 'min-h-[90vh]',
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  height = 'auto',
  showHandle = true,
  children
}) => {
  // Lock body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)]"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0',
          'bg-[var(--bg-overlay)]',
          'animate-fade-in'
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0',
          'z-[var(--z-modal)]',
          'animate-slide-in-up'
        )}
      >
        <div
          className={cn(
            'bg-[var(--surface-primary)]',
            'rounded-t-[var(--radius-3xl)]',
            'border-t border-[var(--border-default)]',
            'shadow-[var(--shadow-xl)]',
            // Safe area padding
            'pb-[max(var(--space-4),env(safe-area-inset-bottom))]',
            heightStyles[height]
          )}
        >
          {/* Handle */}
          {showHandle && (
            <div className="flex justify-center pt-[var(--space-3)] pb-[var(--space-2)]">
              <div
                className={cn(
                  'w-10 h-1',
                  'rounded-full',
                  'bg-[var(--border-strong)]'
                )}
              />
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BOTTOM SHEET PARTS
// ─────────────────────────────────────────────────────────────

const BottomSheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-[var(--space-6)]',
      'pb-[var(--space-4)]',
      'border-b border-[var(--border-subtle)]',
      className
    )}
    {...props}
  />
))
BottomSheetHeader.displayName = "BottomSheetHeader"

const BottomSheetBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-[var(--space-6)]',
      'max-h-[60vh]',
      'overflow-y-auto',
      '-webkit-overflow-scrolling-touch',
      className
    )}
    {...props}
  />
))
BottomSheetBody.displayName = "BottomSheetBody"

const BottomSheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'px-[var(--space-6)]',
      'pt-[var(--space-4)]',
      'border-t border-[var(--border-subtle)]',
      className
    )}
    {...props}
  />
))
BottomSheetFooter.displayName = "BottomSheetFooter"

// ─────────────────────────────────────────────────────────────
// ALERT DIALOG (Confirmation dialogs)
// ─────────────────────────────────────────────────────────────

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive'
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} closeOnBackdrop={false}>
      <DialogContent size="sm" showClose={false}>
        <div className="p-[var(--space-6)] text-center">
          <h2
            className={cn(
              'text-[var(--text-lg)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-primary)]',
              'mb-[var(--space-2)]'
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'leading-[var(--leading-relaxed)]'
              )}
            >
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex gap-[var(--space-3)]',
            'p-[var(--space-6)]',
            'pt-0'
          )}
        >
          <button
            onClick={handleCancel}
            className={cn(
              'flex-1',
              'h-[var(--height-button)]',
              'rounded-[var(--radius-xl)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-base)]',
              'bg-[var(--surface-secondary)]',
              'text-[var(--text-primary)]',
              'border border-[var(--border-default)]',
              'hover:bg-[var(--surface-hover)]',
              'active:scale-[0.98]',
              'transition-all duration-[var(--duration-fast)]'
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'flex-1',
              'h-[var(--height-button)]',
              'rounded-[var(--radius-xl)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-base)]',
              'text-[var(--text-on-brand)]',
              variant === 'destructive'
                ? 'bg-[var(--status-error-bg)]'
                : 'bg-[var(--brand-primary)]',
              variant === 'destructive'
                ? 'hover:brightness-110'
                : 'hover:bg-[var(--brand-primary-hover)]',
              'active:scale-[0.98]',
              'transition-all duration-[var(--duration-fast)]'
            )}
          >
            {confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────
// CLOSE ICON
// ─────────────────────────────────────────────────────────────

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

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  BottomSheet,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  AlertDialog,
}
