import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F1] px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F3E9D5] shadow-lg text-center">
            <div className="w-16 h-16 bg-[#F3E9D5]/60 text-[#24452D] rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold">
              🌿
            </div>
            <h2 className="text-2xl font-bold text-[#24452D] mb-2 font-display">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We encountered an unexpected display issue. Your data and session are safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-[#24452D] text-white font-medium hover:bg-[#1b3522] transition-colors shadow-sm"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 rounded-xl border border-[#D5C29D] text-[#24452D] font-medium hover:bg-[#FAF8F1] transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
