import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Practice = lazy(() => import("./pages/Practice"));
const PracticeSession = lazy(() => import("./pages/PracticeSession"));
const MockTest = lazy(() => import("./pages/MockTest"));
const ScoreReport = lazy(() => import("./pages/ScoreReport"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm font-medium">Loading...</p>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/practice" component={Practice} />
        <Route path="/practice/:section" component={Practice} />
        <Route path="/session/:sessionId" component={PracticeSession} />
        <Route path="/mock-test" component={MockTest} />
        <Route path="/score-report/:sessionId" component={ScoreReport} />
      </Switch>
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
