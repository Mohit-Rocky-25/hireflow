import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorNotice } from './ErrorNotice';

interface Props {
  children: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ToolErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ToolErrorBoundary:${this.props.toolName || 'Tool'}] Uncaught error:`, error, errorInfo);
  }

  public handleReset = () => {
    this.state = { hasError: false, error: null };
    try {
      this.setState({ hasError: false, error: null });
    } catch {
      // safe fallback if not mounted
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-8 space-y-4">
          <ErrorNotice
            title={`${this.props.toolName || 'Tool'} encountered an unexpected error`}
            message={this.state.error?.message || 'An unexpected rendering error occurred in this tool view.'}
            onRetry={this.handleReset}
          />
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
            >
              ← Go Back
            </button>
            <a
              href="/"
              className="px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Return to Candidate Hub
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
