import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You could log the error to an error reporting service here
    console.error('Uncaught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state

    if (hasError) {
      return (
        <div className="hero min-h-screen bg-red-100">
          <div className="hero-content text-center rounded-lg p-6 max-w-xl bg-white mx-auto">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-red-600">Something went wrong</h1>
              <p className="py-6 text-gray-700">
                {error?.message.includes('Attempt to get default algod configuration')
                  ? 'Please check your .env file. You might be missing Algorand network configuration. Copy .env.template and set the correct values.'
                  : error?.message || 'An unexpected error occurred.'}
              </p>

              {import.meta.env.DEV && errorInfo && (
                <details className="text-left text-sm text-gray-600 whitespace-pre-wrap">
                  <summary className="cursor-pointer font-semibold">Click to view error details</summary>
                  {errorInfo.componentStack}
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
