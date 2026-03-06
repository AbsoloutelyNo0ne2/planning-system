/**
 * @fileoverview Error Boundary Component
 *
 * PURPOSE:
 * Catches React rendering errors and displays them instead of white screen.
 * Wraps the App component to catch errors during render, mount, or update.
 *
 * USAGE:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import * as React from 'react';

// SECTION: Props Interface
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// SECTION: State Interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// SECTION: Error Boundary Component
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // REASONING:
  // This lifecycle method is called when a descendant component throws an error.
  // It allows us to update state and display a fallback UI.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  // REASONING:
  // This lifecycle method is called after an error is thrown.
  // We can log error details to console or error reporting service.
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });
  }

  // REASONING:
  // Render error UI when an error occurs, otherwise render children normally.
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#fef2f2',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '2rem',
              border: '1px solid #fee2e2',
            }}
          >
            <h1
              style={{
                color: '#dc2626',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              ⚠️ Application Error
            </h1>

            <p
              style={{
                color: '#374151',
                marginBottom: '1rem',
                fontSize: '1rem',
              }}
            >
              The application encountered an error. Check the details below:
            </p>

            {/* Error Message */}
            <div
              style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                }}
              >
                Error Message:
              </h2>
              <pre
                style={{
                  color: '#7f1d1d',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </div>

            {/* Stack Trace */}
            {this.state.error?.stack && (
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <h2
                  style={{
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}
                >
                  Stack Trace:
                </h2>
                <pre
                  style={{
                    color: '#4b5563',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '300px',
                    overflow: 'auto',
                    margin: 0,
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            {/* Component Stack */}
            {this.state.errorInfo?.componentStack && (
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <h2
                  style={{
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}
                >
                  Component Stack:
                </h2>
                <pre
                  style={{
                    color: '#4b5563',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '200px',
                    overflow: 'auto',
                    margin: 0,
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Reload Button */}
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
