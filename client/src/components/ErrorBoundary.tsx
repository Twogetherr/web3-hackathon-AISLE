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
    return { error };
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
        <main className="flex min-h-screen items-center justify-center bg-[#fae7cc] px-6">
          <section className="w-full max-w-lg rounded-xl border border-[#771111]/30 bg-[#fae7cc] p-8 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#771111]/60">
              AISLE
            </p>
            <h1 className="mt-4 font-serif text-3xl font-bold text-[#771111]">Something went wrong</h1>
            <p className="mt-3 text-sm text-[#771111]/60">{this.state.error.message}</p>
            <button
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#771111] px-6 text-sm font-bold uppercase tracking-widest text-[#fae7cc] transition hover:bg-[#5a0d0d]"
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