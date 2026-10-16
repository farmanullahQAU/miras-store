import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-[#1C1917]">
          <div className="max-w-md w-full bg-white border border-stone-200 rounded-lg p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#B85338]/10 text-[#B85338] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-semibold mb-2">Something Interrupted Your Experience</h1>
            <p className="text-sm text-stone-600 mb-6">
              We encountered an unexpected display issue while rendering this view. Your shopping bag and saved items remain intact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C1917] text-white text-sm font-medium rounded hover:bg-[#B85338] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reload Page
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-stone-300 text-[#1C1917] text-sm font-medium rounded hover:bg-stone-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
