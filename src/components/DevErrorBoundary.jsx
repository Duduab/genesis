import { Component } from 'react'
import { logDevError } from '../lib/devErrorReporting'

/**
 * Catches render/lifecycle errors in the tree below and logs rich diagnostics to the console.
 */
export default class DevErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    logDevError('React.ErrorBoundary', error, {
      componentStack: info.componentStack,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-50 p-8 text-center font-sans text-surface-800">
          <h1 className="text-xl font-bold text-surface-900">Something went wrong</h1>
          <p className="max-w-md text-sm text-surface-600">
            A detailed report was written to the browser console for developers. You can try reloading the page.
          </p>
          <button
            type="button"
            className="rounded-xl bg-genesis-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-genesis-700"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
