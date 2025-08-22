import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error to an error reporting service here
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-screen px-4 text-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100 max-w-lg w-full">
            <h1 className="text-2xl font-bold text-pink-600 mb-4">Something went wrong.</h1>
            <p className="text-gray-500 text-base">Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
