import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Suspense } from "react";
import PTELayout from "./components/PTELayout";

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm font-medium">Loading PTEMaster...</p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PTELayout>
        <Switch>
          <Route path="/" component={() => <div className="p-8 font-semibold">PTEMaster Main Workspace</div>} />
        </Switch>
      </PTELayout>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
