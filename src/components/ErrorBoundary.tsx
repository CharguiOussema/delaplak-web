import { Component, type ErrorInfo, type ReactNode } from "react";
import { Result, Button } from "antd";
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { logError } from "../utils/errorHandling";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, "React Error Boundary");
    logError(errorInfo.componentStack, "Component Stack");
    this.setState({ error, errorInfo });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback && errorInfo) {
        return fallback(error, errorInfo);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try reloading the page or contact support if the problem persists."
            extra={[
              <Button key="reload" type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
                Reload Page
              </Button>,
              <Button key="home" icon={<HomeOutlined />} onClick={this.handleGoHome}>
                Go Home
              </Button>,
            ]}
          />
        </div>
      );
    }

    return children;
  }
}
