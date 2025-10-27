import React, { Component, ErrorInfo, ReactNode } from "react";

/**
 * Enterprise-grade ErrorBoundary for robust error handling.
 * Features: Monitoring integration, customizable fallback, reset, accessibility, error details, user feedback.
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  showStack?: boolean;
  allowReset?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Monitoring integration (replace with Sentry, Datadog, etc.)
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    // Example: window.logErrorToService?.(error, info);
    // ...
    this.setState({ errorInfo: info });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReport = () => {
    // Example: open support modal or send error to backend
    window.open("mailto:support@ghostcrm.com?subject=Error Report&body=" + encodeURIComponent(this.state.error?.message || ""));
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showStack, allowReset } = this.props;
      return (
        <div
          className="p-4 bg-red-100 text-red-800 rounded"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
        >
          {fallback ? (
            fallback
          ) : (
            <>
              <strong>Something went wrong.</strong>
              <pre className="text-xs mt-2" aria-label="Error message">{this.state.error?.message}</pre>
              {showStack && this.state.errorInfo?.componentStack && (
                <details className="mt-2">
                  <summary>Stack Trace</summary>
                  <pre className="text-xs whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  onClick={this.handleReport}
                  aria-label="Report Issue"
                >
                  Report Issue
                </button>
                {allowReset && (
                  <button
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                    onClick={this.handleReset}
                    aria-label="Try Again"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
