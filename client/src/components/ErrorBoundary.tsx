import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
                  "bg-primary text-primary-foreground shadow-sm",
                  "hover:bg-primary/90 transition-all cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Reload Page
              </button>
              <button
                onClick={() => { window.location.href = "/dashboard"; }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium",
                  "bg-secondary text-secondary-foreground border border-border",
                  "hover:bg-secondary/80 transition-all cursor-pointer"
                )}
              >
                Return to Dashboard
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
