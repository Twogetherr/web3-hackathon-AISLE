import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled React error", {
      error,
      componentStack: errorInfo.componentStack,
      requestId: "client"
    });
  }

  public render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-white">
          <section className="w-full max-w-lg rounded-lg border border-[#2A2A2A] bg-[#181818] p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00C853]">
              AISLE
            </p>
            <h1 className="mt-4 text-3xl font-semibold">Something went wrong</h1>
            <p className="mt-3 text-sm text-[#A0A0A0]">{this.state.error.message}</p>
            <button
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#00C853] px-5 text-sm font-semibold text-[#08110A] transition hover:bg-[#20db68]"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
