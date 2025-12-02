import React, { ErrorInfo, ReactNode } from 'react';
import { cn } from '../lib/utils';
import { XCircleIcon } from './icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors in child components, logs them, and displays a fallback UI.
 * Prevents the entire app from crashing when a component throws an error.
 *
 * Usage:
 * <ErrorBoundary componentName="SessionTracker">
 *   <SessionTracker {...props} />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  declare state: State;
  declare props: Readonly<Props>;
  declare setState: React.Component<Props, State>['setState'];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to analytics service
    // analytics.track('component_error', { componentName: this.props.componentName, error: error.message });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center',
            'min-h-[400px]',
            'p-[var(--space-6)]',
            'bg-[var(--surface-primary)]',
            'border border-[var(--border-default)]',
            'rounded-[var(--radius-xl)]',
            'text-center'
          )}
        >
          <div
            className={cn(
              'w-16 h-16',
              'bg-[var(--status-error-bg)]/10',
              'rounded-full',
              'flex items-center justify-center',
              'mb-[var(--space-4)]'
            )}
          >
            <XCircleIcon className="w-8 h-8 text-[var(--status-error-bg)]" />
          </div>

          <h2
            className={cn(
              'text-[var(--text-lg)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-primary)]',
              'mb-[var(--space-2)]'
            )}
          >
            Something went wrong
          </h2>

          <p
            className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]',
              'mb-[var(--space-4)]',
              'max-w-md'
            )}
          >
            {this.props.componentName
              ? `The ${this.props.componentName} component encountered an error.`
              : 'An unexpected error occurred.'}
          </p>

          {this.state.error && (
            <details
              className={cn(
                'w-full max-w-md',
                'mb-[var(--space-4)]',
                'text-left'
              )}
            >
              <summary
                className={cn(
                  'cursor-pointer',
                  'text-[var(--text-xs)]',
                  'text-[var(--text-tertiary)]',
                  'hover:text-[var(--text-secondary)]',
                  'transition-colors'
                )}
              >
                View error details
              </summary>
              <pre
                className={cn(
                  'mt-[var(--space-2)]',
                  'p-[var(--space-3)]',
                  'bg-[var(--surface-secondary)]',
                  'border border-[var(--border-default)]',
                  'rounded-[var(--radius-lg)]',
                  'text-[var(--text-2xs)]',
                  'text-[var(--status-error-bg)]',
                  'overflow-auto',
                  'max-h-48'
                )}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className={cn(
              'px-[var(--space-6)]',
              'py-[var(--space-3)]',
              'bg-[var(--brand-primary)]',
              'text-[var(--text-on-brand)]',
              'rounded-[var(--radius-lg)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-sm)]',
              'hover:bg-[var(--brand-primary-hover)]',
              'transition-colors',
              'shadow-[var(--shadow-md)]'
            )}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
