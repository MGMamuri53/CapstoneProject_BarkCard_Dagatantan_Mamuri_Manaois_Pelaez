import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center p-4">
          <div className="card border-danger shadow-lg" style={{ maxWidth: '500px' }}>
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">Something Went Wrong</h5>
            </div>
            <div className="card-body">
              <p className="text-muted mb-3">
                The application encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
              <details className="small mb-3 p-3 bg-light rounded" style={{ cursor: 'pointer' }}>
                <summary className="fw-bold text-danger">Error Details</summary>
                <pre className="mt-2 mb-0 text-muted" style={{ fontSize: '0.75rem', overflowX: 'auto' }}>
                  {this.state.error && this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
              <button
                onClick={() => window.location.href = '/'}
                className="btn btn-danger w-100"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
