import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PTELayout from "@/components/PTELayout";
import {
  Brain, Target, TrendingUp, Calendar, Clock, Zap, ChevronRight,
  CheckCircle, AlertTriangle, Star, Loader2, Sparkles, BookOpen,
  Mic, PenLine, Headphones, BarChart3
} from "lucide-react";

const LEVEL_COLORS = {
  "Beginner": "bg-red-100 text-red-700",
  "Elementary": "bg-orange-100 text-orange-700",
  "Intermediate": "bg-amber-100 text-amber-700",
  "Upper-Intermediate": "bg-blue-100 text-blue-700",
  "Advanced": "bg-emerald-100 text-emerald-700",
};

const PRIORITY_STYLES = {
  critical: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", icon: "🔴" },
  important: { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "🟡" },
  "nice-to-have": { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", icon: "🟢" },
};

export default function CoachingPlan() {
  const [targetScore, setTargetScore] = useState(65);
  const [activeWeek, setActiveWeek] = useState(1);

  const generatePlan = trpc.aiCoach.getCoachingPlan.useMutation();

  const plan = generatePlan.data;

  return (
    <PTELayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Coaching Plan</h1>
              <p className="text-sm text-gray-500">Personalized 4-week study roadmap based on your performance</p>
            </div>
          </div>
        </div>

        {!plan && !generatePlan.isPending && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Generate Your Personalized Plan</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Our AI coach will analyze your practice history and create a customized 4-week study plan to help you reach your target score.
            </p>

            {/* Target Score Selector */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-gray-700 mb-4">What's your target PTE score?</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50, 58, 65, 79].map(score => (
                  <button
                    key={score}
                    onClick={() => setTargetScore(score)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      targetScore === score
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 text-gray-600 hover:border-teal-300"
                    }`}
                  >
                    {score}+
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={10}
                max={90}
                step={1}
                value={targetScore}
                onChange={e => setTargetScore(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <p className="text-center text-teal-600 font-bold mt-2">Target: {targetScore}/90</p>
            </div>

            <button
              onClick={() => generatePlan.mutate({ targetScore })}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors mx-auto shadow-lg shadow-teal-200"
            >
              <Brain className="w-5 h-5" />
              Generate My Coaching Plan
            </button>
          </div>
        )}

        {generatePlan.isPending && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">AI is building your personalized plan...</p>
            <p className="text-sm text-gray-500 mt-2">Analyzing your performance data and creating a custom roadmap</p>
          </div>
        )}

        {plan && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${LEVEL_COLORS[plan.studentLevel]} `}>
                      {plan.studentLevel}
                    </span>
                  </div>
                  <p className="text-teal-100 text-sm leading-relaxed mb-4">{plan.overallAssessment}</p>
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-teal-100 text-xs font-semibold mb-1">AI Coach Says:</p>
                    <p className="text-white text-sm italic">"{plan.motivationalMessage}"</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-teal-200 text-xs mb-1">Current Score</p>
                    <p className="text-4xl font-extrabold">{plan.currentEstimatedScore}</p>
                    <p className="text-teal-200 text-xs">/ 90</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-teal-200 text-xs mb-1">Target Score</p>
                    <p className="text-4xl font-extrabold text-yellow-300">{plan.targetScore}</p>
                    <p className="text-teal-200 text-xs">/ 90</p>
                  </div>
                  <div className="bg-yellow-400/20 rounded-xl p-3 text-center">
                    <p className="text-yellow-200 text-xs">Gap to Close</p>
                    <p className="text-2xl font-extrabold text-yellow-300">+{plan.targetScore - plan.currentEstimatedScore}</p>
                    <p className="text-yellow-200 text-xs">points needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Practice Recommendation */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Daily Practice Schedule</h2>
                  <p className="text-xs text-gray-500">{plan.dailyPracticeRecommendation.totalMinutes} minutes per day</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {plan.dailyPracticeRecommendation.breakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-700 font-bold text-sm">{item.minutes}m</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.activity}</p>
                      <p className="text-xs text-gray-500">{item.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Plan */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="font-bold text-gray-900">4-Week Study Plan</h2>
              </div>

              {/* Week tabs */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {plan.weeklyPlan.map(week => (
                  <button
                    key={week.week}
                    onClick={() => setActiveWeek(week.week)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeWeek === week.week
                        ? "bg-teal-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Week {week.week}
                  </button>
                ))}
              </div>

              {plan.weeklyPlan.filter(w => w.week === activeWeek).map(week => (
                <div key={week.week}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{week.focus}</h3>
                      <p className="text-sm text-teal-600 font-medium">{week.targetImprovement}</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-1.5">
                      <p className="text-xs font-semibold text-teal-700">Week {week.week} Goal</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {week.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-teal-700 font-bold text-xs">{i + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Skill Gaps */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="font-bold text-gray-900">Skill Gap Analysis</h2>
              </div>
              <div className="space-y-4">
                {plan.skillGaps.map((gap, i) => {
                  const style = PRIORITY_STYLES[gap.priority];
                  return (
                    <div key={i} className={`border rounded-xl p-4 ${style.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span>{style.icon}</span>
                          <span className="font-bold text-gray-900">{gap.skill}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                            {gap.priority}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {gap.currentLevel} → <span className="text-teal-600">{gap.targetLevel}</span>
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="absolute left-0 top-0 h-full bg-gray-400 rounded-full"
                          style={{ width: `${((gap.currentLevel - 10) / 80) * 100}%` }}
                        />
                        <div
                          className="absolute left-0 top-0 h-full bg-teal-500 rounded-full opacity-40"
                          style={{ width: `${((gap.targetLevel - 10) / 80) * 100}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gap.resources.map((r, j) => (
                          <span key={j} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regenerate */}
            <div className="text-center">
              <button
                onClick={() => generatePlan.mutate({ targetScore })}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </PTELayout>
  );
}
