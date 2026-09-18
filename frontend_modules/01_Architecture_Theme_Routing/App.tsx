import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";

// Eagerly load the landing page for instant first paint
import Home from "./pages/Home";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";

// Lazy-load all authenticated pages to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminPaymentsPage = lazy(() => import("./pages/AdminPaymentsPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const SystemAdminPanel = lazy(() => import("./pages/SystemAdminPanel"));
const Practice = lazy(() => import("./pages/Practice"));
const PracticeSession = lazy(() => import("./pages/PracticeSession"));
const MockTest = lazy(() => import("./pages/MockTest"));
const ScoreReport = lazy(() => import("./pages/ScoreReport"));
const Analytics = lazy(() => import("./pages/Analytics"));
const LearningModes = lazy(() => import("./pages/LearningModes"));
const Profile = lazy(() => import("./pages/Profile"));
const CoachingPlan = lazy(() => import("./pages/CoachingPlan"));
const RevisionMode = lazy(() => import("./pages/RevisionMode"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-14 h-14">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Loading...</p>
      </motion.div>
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
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/dashboard" component={AdminDashboardPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/payments" component={AdminPaymentsPage} />
        <Route path="/payments" component={PaymentHistory} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/system-admin" component={SystemAdminPanel} />
        <Route path="/practice" component={Practice} />
        <Route path="/practice/:section" component={Practice} />
        <Route path="/session/:sessionId" component={PracticeSession} />
        <Route path="/mock-test" component={MockTest} />
        <Route path="/score-report/:sessionId" component={ScoreReport} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/learning-modes" component={LearningModes} />
        <Route path="/profile" component={Profile} />
        <Route path="/coaching-plan" component={CoachingPlan} />
        <Route path="/revision" component={RevisionMode} />
        <Route path="/resources" component={Resources} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
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
