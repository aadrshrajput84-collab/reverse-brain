import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Reverse Brain caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('REVERSE_BRAIN_V1_SAVE');
    } catch {}
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#05050c] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            🧠
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-wider text-purple-300 uppercase mb-2">
            NEURAL REBOOT REQUIRED
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mb-6 leading-relaxed">
            A cognitive synchronization hiccup occurred. Tap below to reload your neural matrix.
          </p>
          <button
            onClick={this.handleReload}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-mono font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 transition-all border border-purple-400"
          >
            REBOOT REVERSE BRAIN
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
