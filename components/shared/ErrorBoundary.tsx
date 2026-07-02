import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6">
            <span className="text-rose-500 text-3xl font-black">!</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-8 py-3 bg-brand-primary text-white font-black rounded-xl hover:bg-slate-800 transition-all text-sm uppercase tracking-widest"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}