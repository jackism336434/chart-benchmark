import { Component, type ReactNode } from 'react'

interface Props {
  library: string
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
          <div className="text-red-400 text-sm font-medium">Render Error</div>
          <div className="text-gray-500 text-xs text-center max-w-md">
            {this.props.library} failed to render. Try different parameters or reset.
          </div>
          <div className="text-gray-600 text-[10px] font-mono max-w-md overflow-auto">
            {this.state.error?.message}
          </div>
          <button onClick={this.resetErrorBoundary} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors">Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}