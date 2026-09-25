import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Home, BookOpen, BarChart3, Target, Settings, LogOut,
  Mic, PenLine, Headphones, ChevronRight, Bell, Search,
  Trophy, Clock, Flame, TrendingUp, Play, Brain, Zap, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { pageVariants, staggerContainer, staggerItem, cardHover } from "@/lib/animations";

const NAV_ITEMS = [
  { icon: Home,      label: "Home",         href: "/dashboard" },
  { icon: BookOpen,  label: "PTE Practice", href: "/practice" },
  { icon: Target,    label: "Mock Tests",   href: "/mock-test" },
  { icon: Brain,     label: "Study Modes",  href: "/learning-modes" },
  { icon: BarChart3, label: "Analytics",    href: "/analytics" },
  { icon: Settings,  label: "Settings",     href: "/profile" },
];

const SECTION_TASKS = [
  { code: "RA",  label: "Read Aloud",               color: "#EF5350", href: "/practice/speaking" },
  { code: "RS",  label: "Repeat Sentence",           color: "#26C6DA", href: "/practice/speaking" },
  { code: "DI",  label: "Describe Image",            color: "#FF9800", href: "/practice/speaking" },
  { code: "SWT", label: "Summarize Written Text",    color: "#2196F3", href: "/practice/writing" },
  { code: "WE",  label: "Write Essay",               color: "#FF5722", href: "/practice/writing" },
  { code: "RO",  label: "Re-order Paragraphs",       color: "#F44336", href: "/practice/reading" },
  { code: "FIB", label: "Fill in the Blanks",        color: "#00BCD4", href: "/practice/reading" },
  { code: "WFD", label: "Write from Dictation",      color: "#00BCD4", href: "/practice/listening" },
  { code: "HIW", label: "Highlight Incorrect Words", color: "#F44336", href: "/practice/listening" },
];

function Sidebar({ currentPath }: { currentPath: string }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <aside className="flex-shrink-0 flex flex-col" style={{ backgroundColor: "#1A2332", width: "220px", minHeight: "100vh" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "#243447" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #26C6DA, #00ACC1)" }}>
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">PTE Practice</span>
        </div>
      </div>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#243447" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ backgroundColor: "#26C6DA" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || "Student"}</p>
            <p className="text-xs truncate" style={{ color: "#8899AA" }}>{user?.email || "PTE Learner"}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive = currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className="flex items-center gap-3 py-2.5 text-sm cursor-pointer transition-all"
                style={{
                  paddingLeft: isActive ? "17px" : "20px",
                  paddingRight: "20px",
                  color: isActive ? "#26C6DA" : "rgba(255,255,255,0.65)",
                  backgroundColor: isActive ? "#243447" : "transparent",
                  borderLeft: isActive ? "3px solid #26C6DA" : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = "#243447"; (e.currentTarget as HTMLElement).style.color = "white"; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; } }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t" style={{ borderColor: "#243447" }}>
        <button
          onClick={() => { logout(); toast.success("Logged out"); }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const { data: analytics } = trpc.analytics.myStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: todayTarget } = trpc.analytics.todayTarget.useQuery(undefined, { enabled: isAuthenticated });
  const { data: milestones } = trpc.analytics.milestones.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history } = trpc.sessions.myHistory.useQuery({ limit: 5 }, { enabled: isAuthenticated });
  const generateTarget = trpc.analytics.generateTarget.useMutation({ onSuccess: () => toast.success("Daily target set!") });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="text-center">
          <motion.div
            className="w-10 h-10 rounded-full border-4 mx-auto mb-3"
            style={{ borderColor: "#26C6DA", borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-gray-500 text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >Loading...</motion.p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#E0F7FA" }}>
            <BookOpen className="w-7 h-7" style={{ color: "#26C6DA" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In to Continue</h2>
          <p className="text-gray-500 text-sm mb-6">Access your personalized PTE practice dashboard</p>
          <a href={getLoginUrl()} className="block w-full py-3 rounded-lg text-white font-semibold text-sm text-center" style={{ backgroundColor: "#26C6DA" }}>
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const totalPracticed = analytics?.totalSessions || 0;
  const todayPracticed = analytics?.sessions?.filter((s: any) => {
    const today = new Date(); const d = new Date(s.createdAt);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }).length || 0;
  const avgScore = analytics?.avgScore || 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <Sidebar currentPath={location} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Question Content / Number" className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 bg-gray-50" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4 text-gray-500" />
              {(milestones?.length || 0) > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: "#EF5350" }} />}
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#26C6DA" }}>
              {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            className="max-w-6xl mx-auto space-y-5"
            variants={pageVariants}
            initial="initial"
            animate="animate"
          >
            {/* Exam banner */}
            <motion.div
              className="rounded-xl p-4 text-white flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #26C6DA 0%, #00ACC1 100%)" }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold">Target Score: 79</p>
                  <p className="text-xs text-white/80">Keep practicing daily to reach your goal</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">180</p>
                <p className="text-xs text-white/80">Days to prepare</p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-5">
              {/* Study Stats */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Study Stats</h2>
                  <Link href="/analytics"><span className="text-xs flex items-center gap-1 cursor-pointer" style={{ color: "#26C6DA" }}>Study Centre <ChevronRight className="w-3 h-3" /></span></Link>
                </div>
                <motion.div
                  className="grid grid-cols-3 gap-4 mb-5"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {[
                    { value: todayPracticed, label: "Today Practiced", icon: Flame, color: "#EF5350" },
                    { value: totalPracticed, label: "Total Practiced", icon: CheckCircle2, color: "#26C6DA" },
                    { value: analytics?.sessions?.length ? new Set(analytics.sessions.map((s: any) => new Date(s.createdAt).toDateString())).size : 0, label: "Prac. Days", icon: Trophy, color: "#FF9800" },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <motion.div key={label} variants={staggerItem} className="text-center p-3 rounded-xl" style={{ backgroundColor: `${color}12` }}>
                      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                      <AnimatedCounter value={value} className="text-2xl font-bold text-gray-900" />
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </motion.div>
                  ))}
                </motion.div>
                {/* AI Study Tips */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">AI Study Tips</h3>
                    <Link href="/analytics"><span className="text-xs cursor-pointer" style={{ color: "#26C6DA" }}>Detail &gt;</span></Link>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "#F0FFFE" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: "#26C6DA" }}>79</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-2">Target: 79</p>
                      <div className="flex items-center gap-4">
                        {[
                          { code: "RA", color: "#EF5350", pct: avgScore > 0 ? Math.round(avgScore * 0.9) : 0 },
                          { code: "RS", color: "#26C6DA", pct: avgScore > 0 ? Math.round(avgScore * 0.85) : 0 },
                          { code: "WE", color: "#FF5722", pct: avgScore > 0 ? Math.round(avgScore * 0.95) : 0 },
                        ].map(({ code, color, pct }) => (
                          <div key={code} className="flex items-center gap-1.5">
                            <div className="task-badge w-6 h-6 text-[10px]" style={{ backgroundColor: color }}>{code}</div>
                            <div>
                              <p className="text-xs text-gray-500">My: {pct ? `${pct}%` : "--%"}</p>
                      <AnimatedProgressBar value={pct} height={6} color="" className="w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Today's target */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Today's Target</h3>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  {todayTarget ? (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{todayTarget.completedMinutes || 0}/{todayTarget.targetMinutes} min</span>
                      </div>
                              <AnimatedProgressBar
                        value={Math.min(100, ((todayTarget.completedMinutes || 0) / (todayTarget.targetMinutes ?? 30)) * 100)}
                        height={8}
                        color="bg-cyan-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">Focus: {Array.isArray(todayTarget.focusSkills) ? todayTarget.focusSkills.join(", ") : "All skills"}</p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 mb-2">No target set for today</p>
                      <button onClick={() => generateTarget.mutate({ targetMinutes: 30 })} className="text-xs px-3 py-1.5 rounded-lg text-white font-medium" style={{ backgroundColor: "#26C6DA" }}>
                        Set 30-min Target
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Practice */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Practice</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Read Aloud", href: "/practice/speaking", color: "#EF5350", code: "RA" },
                      { label: "Write Essay", href: "/practice/writing", color: "#FF5722", code: "WE" },
                      { label: "Write from Dictation", href: "/practice/listening", color: "#00BCD4", code: "WFD" },
                    ].map(({ label, href, color, code }) => (
                      <Link key={code} href={href}>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="task-badge w-7 h-7 text-[10px]" style={{ backgroundColor: color }}>{code}</div>
                          <span className="text-xs text-gray-700 flex-1">{label}</span>
                          <Play className="w-3 h-3 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tools */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Study Tools</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Brain,      label: "AI Analysis",  desc: "Accurate score report analysis", color: "#FF9800", href: "/analytics" },
                  { icon: Target,     label: "Mock Tests",   desc: "Test & know your scores",        color: "#26C6DA", href: "/mock-test" },
                  { icon: Zap,        label: "Study Modes",  desc: "Beginner to exam mode",          color: "#9C27B0", href: "/learning-modes" },
                  { icon: TrendingUp, label: "Progress",     desc: "Track your improvement",         color: "#4CAF50", href: "/analytics" },
                ].map(({ icon: Icon, label, desc, color, href }, i) => (
                  <Link key={label} href={href}>
                    <motion.div
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 cursor-pointer"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)", borderColor: color }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Task Types */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Practice by Task Type</h2>
                <Link href="/practice"><span className="text-xs cursor-pointer" style={{ color: "#26C6DA" }}>View All &gt;</span></Link>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {SECTION_TASKS.map(({ code, label, color, href }, i) => (
                  <Link key={code} href={href}>
                    <motion.div
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 cursor-pointer"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      whileHover={{ borderColor: color, backgroundColor: `${color}10`, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="task-badge w-7 h-7 text-[10px] flex-shrink-0" style={{ backgroundColor: color }}>{code}</div>
                      <span className="text-xs text-gray-600 leading-tight hidden md:block">{label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Sessions */}
            {history && history.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Recent Sessions</h2>
                  <Link href="/analytics"><span className="text-xs cursor-pointer" style={{ color: "#26C6DA" }}>View All &gt;</span></Link>
                </div>
                <div className="space-y-2">
                  {history.slice(0, 5).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E0F7FA" }}>
                          <BookOpen className="w-4 h-4" style={{ color: "#26C6DA" }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 capitalize">{session.sessionType?.replace(/_/g, " ")}</p>
                          <p className="text-xs text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.overallScore && <span className="text-sm font-bold" style={{ color: "#26C6DA" }}>{Math.round(session.overallScore)}</span>}
                        {session.status === "completed" ? (
                          <Link href={`/score-report/${session.id}`}>
                            <button className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: "#26C6DA" }}>Report</button>
                          </Link>
                        ) : (
                          <Link href={`/session/${session.id}`}>
                            <button className="text-xs px-2 py-1 rounded border" style={{ borderColor: "#26C6DA", color: "#26C6DA" }}>Continue</button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
}
