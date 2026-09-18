import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  BookOpen, Headphones, Mic, PenLine, BarChart3, Brain, Target,
  ChevronRight, Star, Users, Trophy, Clock, CheckCircle, ArrowRight,
  Zap, Shield, TrendingUp, Play
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

const TASK_TYPES = [
  { section: "Speaking", id: "speaking", color: "bg-blue-500", tasks: ["Read Aloud", "Repeat Sentence", "Describe Image", "Re-tell Lecture", "Answer Short Question"], icon: Mic },
  { section: "Writing", id: "writing", color: "bg-purple-500", tasks: ["Summarize Written Text", "Write Essay"], icon: PenLine },
  { section: "Reading", id: "reading", color: "bg-green-500", tasks: ["Fill in the Blanks", "Multiple Choice", "Re-order Paragraphs", "Reading & Writing FIB"], icon: BookOpen },
  { section: "Listening", id: "listening", color: "bg-orange-500", tasks: ["Summarize Spoken Text", "MCQ", "Fill in the Blanks", "Highlight Correct Summary", "Write from Dictation"], icon: Headphones },
];

const STATS = [
  { label: "Practice Questions", value: "500+", icon: BookOpen },
  { label: "Active Learners", value: "10K+", icon: Users },
  { label: "Avg Score Improvement", value: "+18pts", icon: TrendingUp },
  { label: "AI Feedback Sessions", value: "50K+", icon: Brain },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Scoring",
    desc: "Get instant, detailed feedback aligned with official PTE Academic scoring criteria — Content, Form, Language, Pronunciation, and Fluency.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Personalized Coaching",
    desc: "Our AI coach analyzes your weak skills and builds a custom 4-week study plan targeting your specific score gaps.",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    desc: "Track your improvement across all 6 enabling skills — Grammar, Vocabulary, Pronunciation, Oral Fluency, Spelling, and Written Discourse.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Exam Simulation",
    desc: "Full mock tests with real PTE timing, interface, and scoring. Prepare under authentic exam conditions.",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    desc: "Every response scored in seconds. See your errors highlighted, model answers, and specific tips to fix each mistake.",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    icon: Trophy,
    title: "Score Milestones",
    desc: "Set your target score and track milestones. Get notified when you hit key benchmarks on your path to success.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const SCORE_BANDS = [
  { range: "79-90", level: "Expert", color: "bg-emerald-500", desc: "C2 Proficient" },
  { range: "65-78", level: "Advanced", color: "bg-blue-500", desc: "C1 Advanced" },
  { range: "51-64", level: "Upper-Intermediate", color: "bg-violet-500", desc: "B2 Upper-Intermediate" },
  { range: "36-50", level: "Intermediate", color: "bg-amber-500", desc: "B1 Intermediate" },
  { range: "10-35", level: "Elementary", color: "bg-red-500", desc: "A1-A2 Elementary" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* -- Top Navigation -- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">PTE<span className="text-teal-600">Master</span></span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Features</a>
              <a href="#tasks" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Task Types</a>
              <a href="#scores" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Score Guide</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">Pricing</a>
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()} className="text-sm text-gray-600 hover:text-teal-600 transition-colors font-medium">
                    Sign In
                  </a>
                  <a href={getLoginUrl()} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                    Start Free
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* -- Hero Section -- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50 pt-16 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-100 rounded-full opacity-40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Zap className="w-3.5 h-3.5" />
                AI-Powered PTE Academic Preparation
              </motion.div>
              <motion.h1
                className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Achieve Your
                <span className="text-teal-600"> Target PTE Score</span>
                <br />Faster with AI
              </motion.h1>
              <motion.p
                className="text-lg text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Practice all 20 PTE Academic task types with instant AI scoring, personalized coaching plans, and detailed feedback that mirrors the official Pearson scoring engine.
              </motion.p>

              {/* Score target selector */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
                <p className="text-sm font-semibold text-gray-700 mb-3">What's your target score?</p>
                <div className="flex gap-2 flex-wrap">
                  {[50, 58, 65, 79].map(score => (
                    isAuthenticated ? (
                      <Link
                        key={score}
                        href="/practice"
                        className="flex-1 min-w-[70px] text-center py-2.5 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 text-sm font-bold text-gray-700 hover:text-teal-700 transition-all cursor-pointer"
                      >
                        {score}+
                      </Link>
                    ) : (
                      <a
                        key={score}
                        href={getLoginUrl()}
                        className="flex-1 min-w-[70px] text-center py-2.5 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 text-sm font-bold text-gray-700 hover:text-teal-700 transition-all cursor-pointer"
                      >
                        {score}+
                      </a>
                    )
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select your target to get a personalized study plan</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isAuthenticated ? (
                  <Link
                    href="/practice"
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-200"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Practicing
                  </Link>
                ) : (
                  <a
                    href={getLoginUrl()}
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-200"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Start Practicing Free
                  </a>
                )}
                <a
                  href="#features"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3.5 rounded-xl border border-gray-200 transition-colors"
                >
                  See How It Works
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex -space-x-2">
                  {["T", "A", "S", "M"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-xs text-gray-500">Trusted by 10,000+ PTE candidates</p>
                </div>
              </div>
            </motion.div>
            {/* Right: Score Card Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-xs font-medium">PTE Academic Score Report</p>
                      <p className="text-white font-bold text-lg">Sample Score Card</p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-100 text-xs">Overall Score</p>
                      <p className="text-white font-extrabold text-3xl">73</p>
                    </div>
                  </div>
                </div>

                {/* Communicative Skills */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Communicative Skills</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Speaking", score: 75, color: "bg-blue-500" },
                      { label: "Writing", score: 72, color: "bg-purple-500" },
                      { label: "Reading", score: 76, color: "bg-green-500" },
                      { label: "Listening", score: 70, color: "bg-orange-500" },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600">{s.label}</span>
                          <span className="text-xs font-bold text-gray-900">{s.score}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full`} style={{ width: `${((s.score - 10) / 80) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enabling Skills */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Enabling Skills</p>
                  <div className="space-y-2">
                    {[
                      { label: "Grammar", score: 74 },
                      { label: "Oral Fluency", score: 71 },
                      { label: "Pronunciation", score: 69 },
                      { label: "Spelling", score: 80 },
                      { label: "Vocabulary", score: 75 },
                      { label: "Written Discourse", score: 72 },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-28">{s.label}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${((s.score - 10) / 80) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-6 text-right">{s.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Feedback Badge */}
                <div className="mx-6 mb-4 bg-teal-50 border border-teal-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-teal-800">
                      <span className="font-semibold">AI Coach:</span> Your pronunciation score is limiting your overall band. Focus on word stress in academic vocabulary — practice 10 Read Aloud questions daily.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ✓ Real PTE Format
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Stats Bar -- */}
      <section className="bg-teal-600 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {STATS.map(s => (
              <motion.div
                key={s.label}
                className="text-center"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5 }}
              >
                <s.icon className="w-6 h-6 text-teal-200 mx-auto mb-2" />
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-teal-200 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* -- Task Types Section -- */}
      <section id="tasks" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All 20 PTE Academic Task Types</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete coverage of every task type in the official PTE Academic exam, with AI scoring aligned to Pearson's official criteria.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {TASK_TYPES.map(section => (
              <motion.div
                key={section.section}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
              >
                <div className={`${section.color} px-5 py-4`}>
                  <section.icon className="w-6 h-6 text-white mb-2" />
                  <h3 className="text-white font-bold text-lg">{section.section}</h3>
                  <p className="text-white/80 text-xs">{section.tasks.length} task types</p>
                </div>
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {section.tasks.map(task => (
                      <li key={task} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  {isAuthenticated ? (
                    <Link
                      href={`/practice/${section.id}`}
                      className="mt-4 flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Practice Now <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <a
                      href={getLoginUrl()}
                      className="mt-4 flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Practice Now <ChevronRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* -- Features Section -- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built by PTE experts and powered by AI, PTEMaster gives you the tools, feedback, and guidance to reach your target score.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Score Guide Section -- */}
      <section id="scores" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Understand Your PTE Score</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                PTE Academic scores range from 10 to 90. Each score band corresponds to a CEFR level and is accepted by universities, governments, and employers worldwide.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our AI scoring engine evaluates your responses against the same criteria Pearson uses — giving you a realistic preview of your actual exam score before test day.
              </p>
              {isAuthenticated ? (
                <Link href="/practice" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  Get Your Score Estimate
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <a href={getLoginUrl()} className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  Get Your Score Estimate
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="space-y-3">
              {SCORE_BANDS.map(band => (
                <div key={band.range} className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-14 h-14 ${band.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{band.range}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{band.level}</p>
                    <p className="text-sm text-gray-500">{band.desc}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${band.color} rounded-full`}
                        style={{ width: band.range === "79-90" ? "100%" : band.range === "65-78" ? "80%" : band.range === "51-64" ? "60%" : band.range === "36-50" ? "40%" : "20%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* -- Learning Modes -- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Four Ways to Practice</h2>
            <p className="text-gray-600">Choose the mode that fits your study goal today.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎓",
                title: "Beginner Mode",
                desc: "Guided templates, model answers, and step-by-step instructions for each task type.",
                badge: "For Starters",
                badgeColor: "bg-green-100 text-green-700",
              },
              {
                icon: "⏱️",
                title: "Exam Mode",
                desc: "Strict timing, no hints, authentic exam conditions. Know exactly where you stand.",
                badge: "Most Realistic",
                badgeColor: "bg-blue-100 text-blue-700",
              },
              {
                icon: "🔍",
                title: "Diagnostic Mode",
                desc: "Identify your weakest skills with targeted questions and a detailed skill gap report.",
                badge: "Recommended First",
                badgeColor: "bg-purple-100 text-purple-700",
              },
              {
                icon: "🔁",
                title: "Revision Mode",
                desc: "Spaced repetition of your incorrect answers to reinforce learning and fix persistent errors.",
                badge: "High Impact",
                badgeColor: "bg-orange-100 text-orange-700",
              },
            ].map(mode => (
              <div key={mode.title} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{mode.icon}</div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${mode.badgeColor}`}>
                  {mode.badge}
                </span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2">{mode.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- CTA Section -- */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Hit Your Target Score?</h2>
          <p className="text-teal-100 mb-8 text-lg">
            Join thousands of PTE candidates who improved their scores with AI-powered practice. Start free today — no credit card required.
          </p>
          {isAuthenticated ? (
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-teal-700 font-bold px-8 py-4 rounded-xl transition-colors shadow-xl text-lg"
            >
              <Play className="w-5 h-5 fill-teal-600 text-teal-600" />
              Start Practicing
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-teal-700 font-bold px-8 py-4 rounded-xl transition-colors shadow-xl text-lg"
            >
              <Play className="w-5 h-5 fill-teal-600 text-teal-600" />
              Start Practicing Free
            </a>
          )}
          <p className="text-teal-200 text-sm mt-4">500+ practice questions · AI scoring · Personalized coaching</p>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">P</span>
                </div>
                <span className="text-white font-bold">PTEMaster</span>
              </div>
              <p className="text-sm leading-relaxed">AI-powered PTE Academic preparation platform aligned with official Pearson scoring criteria.</p>
            </div>
            {[
              { title: "Practice", links: ["Speaking", "Writing", "Reading", "Listening", "Mock Test"] },
              { title: "Resources", links: ["Score Guide", "Task Types", "Study Plans", "Blog"] },
              { title: "Company", links: ["About", "Privacy Policy", "Terms of Service", "Contact"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href={getLoginUrl()} className="text-sm hover:text-teal-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 PTEMaster. Not affiliated with Pearson Education Ltd. PTE Academic™ is a trademark of Pearson Education Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
