export const clerkAppearance = {
  baseTheme: 'light',
  elements: {
    // Root containers
    rootBox: 'mx-auto w-full',
    card: 'bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-lg',
    main: 'p-6',
    
    // Header
    headerTitle: 'text-[var(--text-primary)] font-semibold text-xl',
    headerSubtitle: 'text-[var(--text-secondary)] text-sm',
    
    // Form fields
    formFieldInput: 'bg-[var(--surface-secondary)] border-[var(--border-strong)] text-[var(--text-primary)] rounded-xl h-12 px-4 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-colors',
    formFieldLabel: 'text-[var(--text-secondary)] text-sm font-medium',
    formFieldSuccessText: 'text-[var(--success)]',
    formFieldErrorText: 'text-[var(--error)]',
    formFieldInputShowPasswordButton: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    
    // Buttons
    formButtonPrimary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl h-12 px-6 transition-all shadow-card',
    formButtonReset: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    
    // Social buttons
    socialButtonsBlockButton: 'bg-[var(--surface-secondary)] border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl h-12 font-medium transition-colors',
    socialButtonsBlockButtonText: 'text-[var(--text-primary)]',
    socialButtonsBlockButtonArrow: 'text-[var(--text-secondary)]',
    
    // Links
    footerActionLink: 'text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors',
    identityPreviewEditButton: 'text-[var(--accent)] hover:text-[var(--accent-hover)]',
    formResendCodeLink: 'text-[var(--accent)] hover:text-[var(--accent-hover)]',
    
    // Dividers
    dividerLine: 'bg-[var(--border)]',
    dividerText: 'text-[var(--text-tertiary)] text-xs',
    
    // Footer
    footer: 'text-[var(--text-tertiary)] text-xs',
    footerPagesLink: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    
    // Alert/Error messages
    alertText: 'text-[var(--error)]',
    formFieldWarningText: 'text-[var(--warning)]',
    
    // Alternative methods
    alternativeMethodsBlockButton: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-strong)]',
    
    // Phone input
    phoneInputBox: 'bg-[var(--surface-secondary)] border-[var(--border-strong)]',
    phoneInput: 'text-[var(--text-primary)]',
    
    // OTP
    otpField: 'bg-[var(--surface-secondary)] border-[var(--border-strong)] text-[var(--text-primary)]',
    
    // User button (if used elsewhere)
    userButtonPopoverCard: 'bg-[var(--surface)] border-[var(--border-strong)]',
    userButtonPopoverActionButton: 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
    userButtonPopoverActionButtonText: 'text-[var(--text-primary)]',
    userButtonPopoverFooter: 'text-[var(--text-tertiary)]',
  },
  variables: {
    colorPrimary: '#C9997D',
    colorText: '#2C2C2C',
    colorTextSecondary: '#6B6B6B',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorBackground: '#FAFAF8',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#2C2C2C',
    colorShimmer: 'rgba(201, 153, 125, 0.15)',
    borderRadius: '12px',
    fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
    fontSize: '16px',
  },
};
