import { Component, type ErrorInfo, type ReactNode } from 'react';

type SecureErrorBoundaryProps = {
  fallback: ReactNode;
  onError?: (error: unknown, info?: ErrorInfo) => void;
  children?: ReactNode;
};

type SecureErrorBoundaryState = {
  hasError: boolean;
};

export class SecureErrorBoundary extends Component<
  SecureErrorBoundaryProps,
  SecureErrorBoundaryState
> {
  state: SecureErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SecureErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children ?? null;
  }
}
