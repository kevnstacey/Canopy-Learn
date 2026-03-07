
import React, { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard ErrorBoundary class component to catch rendering errors in the subtree.
 */
// Fix: Use React.Component and explicitly declare state/props to ensure the TypeScript compiler recognizes these properties.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Declare state and props explicitly to satisfy the TypeScript compiler's property existence checks (fixing errors on lines 21, 43, and 44).
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Fix for line 21: Initializing explicitly declared state property.
    this.state = {
      hasError: false,
      error: null
    };
  }

  /**
   * Static method to update state when an error is caught in the subtree.
   */
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Side-effects when errors occur, such as logging.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Fix for lines 43 and 44: Accessing this.state and this.props which are now explicitly defined members of the class.
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6">
            <div className="max-w-md text-center">
                <div className="text-6xl mb-4">🙈</div>
                <h1 className="text-2xl font-bold mb-2">Oops, something went wrong.</h1>
                <p className="text-slate-500 mb-6">We encountered an unexpected error. Please try refreshing the page.</p>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-left text-sm font-mono text-red-600 dark:text-red-300 mb-6 overflow-auto max-h-32 border border-red-100 dark:border-red-900/50">
                    {error?.message}
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="bg-hh-red text-white font-bold py-2 px-6 rounded-lg hover:bg-hh-red-dark transition-colors shadow-lg"
                >
                    Refresh Page
                </button>
            </div>
        </div>
      );
    }

    /**
     * Return children if no error has occurred.
     */
    return children;
  }
}

export default ErrorBoundary;
