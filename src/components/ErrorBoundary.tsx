import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 min-h-dvh bg-white flex flex-col gap-4">
          <h1 className="text-lg font-bold text-red-600">Error de aplicación</h1>
          <pre className="text-xs text-gray-700 bg-gray-100 rounded-xl p-4 overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="py-3 bg-blue-600 text-white rounded-xl font-medium text-sm"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
