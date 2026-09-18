import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, BookOpen, Mic, PenLine, Headphones, Eye,
  BarChart3, Target, Settings, LogOut, ChevronRight, Trophy,
  GraduationCap, Menu, X, Brain, RotateCcw, FileText
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/practice", label: "Practice", icon: BookOpen },
  { path: "/mock-test", label: "Mock Test", icon: GraduationCap },
  { path: "/revision", label: "Revision Mode", icon: RotateCcw, badge: "srs" },
  { path: "/coaching-plan", label: "AI Coaching Plan", icon: Brain },
  { path: "/learning-modes", label: "Learning Modes", icon: Target },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/resources", label: "Resources", icon: FileText },
  { path: "/profile", label: "Profile", icon: Settings },
];

const sectionItems = [
  { path: "/practice/speaking", label: "Speaking", icon: Mic, color: "text-blue-400" },
  { path: "/practice/writing", label: "Writing", icon: PenLine, color: "text-purple-400" },
  { path: "/practice/reading", label: "Reading", icon: Eye, color: "text-green-400" },
  { path: "/practice/listening", label: "Listening", icon: Headphones, color: "text-orange-400" },
];

interface PTELayoutProps {
  children: React.ReactNode;
  title?: string;
}

function SrsNavItem() {
  const [location] = useLocation();
  const { data: stats } = trpc.srs.getStats.useQuery(undefined, {
    refetchInterval: 60000, // refresh every minute
  });
  const dueCount = stats?.dueNow ?? 0;
  const isActive = location === "/revision";
  return (
    <Link href="/revision">
      <button
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
      >
        <RotateCcw className="w-4 h-4 shrink-0" />
        Revision Mode
        <div className="ml-auto flex items-center gap-1">
          {dueCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {dueCount > 99 ? "99+" : dueCount}
            </span>
          )}
          {isActive && <ChevronRight className="w-3 h-3" />}
        </div>
      </button>
    </Link>
  );
}

export default function PTELayout({ children, title }: PTELayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: () => toast.error("Logout failed"),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <GraduationCap className="w-16 h-16 text-primary mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Sign in to continue</h2>
          <p className="text-muted-foreground">Access your PTE practice platform</p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sidebar-foreground text-sm leading-tight">PTE<span className="text-teal-400">Master</span></p>
              <p className="text-xs text-sidebar-foreground/60">Academic Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SrsNavItem />
          {navItems.filter(i => i.badge !== "srs").map(({ path, label, icon: Icon }) => {
            const isActive = location === path || (path !== "/dashboard" && location.startsWith(path));
            return (
              <Link key={path} href={path}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              </Link>
            );
          })}

          {/* Quick Practice Sections */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
              Quick Practice
            </p>
            {sectionItems.map(({ path, label, icon: Icon, color }) => (
              <Link key={path} href={path}>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    location === path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          {title && (
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          )}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
              <Trophy className="w-3 h-3" />
              PTE-Style Platform
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
