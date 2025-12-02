import * as React from "react"
import { cn } from "../../lib/utils"

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = "Select...", label, error, disabled, className }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    // Close on click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape
    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setIsOpen(false)
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "w-full h-12 px-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl",
              "text-left text-[15px] font-medium",
              "flex items-center justify-between",
              "transition-all duration-200",
              "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-[var(--error)]",
              isOpen && "border-[var(--primary)] ring-2 ring-[var(--primary)]/10"
            )}
            disabled={disabled}
          >
            <span className={selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
              {selectedOption?.label || placeholder}
            </span>
            <svg
              className={cn(
                "w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden animate-scale-in">
              <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (!option.disabled) {
                        onChange(option.value)
                        setIsOpen(false)
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left text-[14px] font-medium transition-colors",
                      option.value === value
                        ? "bg-[var(--primary-light)] text-[var(--primary)]"
                        : "text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={option.disabled}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.value === value && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[12px] text-[var(--error)] font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

// Chip select for multiple selections
interface ChipSelectProps {
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  maxSelections?: number
}

const ChipSelect: React.FC<ChipSelectProps> = ({
  options,
  value,
  onChange,
  label,
  maxSelections
}) => {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue))
    } else {
      if (maxSelections && value.length >= maxSelections) return
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[12px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option.value)
          const isDisabled = option.disabled || (!isSelected && maxSelections && value.length >= maxSelections)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !isDisabled && toggleOption(option.value)}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200",
                "border-2 active:scale-95",
                isSelected
                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={isDisabled as boolean}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Select, ChipSelect }
export type { SelectOption }
