import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Brain, ChevronDown, ChevronUp, Star, AlertTriangle, CheckCircle,
  Lightbulb, Target, BookOpen, TrendingUp, X, Loader2, Sparkles
} from "lucide-react";

interface AIFeedbackPanelProps {
  responseId: number;
  taskType: string;
  score: number;
  maxScore: number;
  onClose?: () => void;
}

const BAND_COLORS: Record<string, string> = {
  "Expert (90)": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Very Good (79-89)": "text-blue-700 bg-blue-50 border-blue-200",
  "Good (65-78)": "text-teal-700 bg-teal-50 border-teal-200",
  "Competent (50-64)": "text-amber-700 bg-amber-50 border-amber-200",
  "Modest (36-49)": "text-orange-700 bg-orange-50 border-orange-200",
  "Limited (10-35)": "text-red-700 bg-red-50 border-red-200",
  // Legacy
  "Excellent": "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Good": "text-blue-700 bg-blue-50 border-blue-200",
  "Satisfactory": "text-amber-700 bg-amber-50 border-amber-200",
  "Needs Improvement": "text-orange-700 bg-orange-50 border-orange-200",
  "Poor": "text-red-700 bg-red-50 border-red-200",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-purple-100 text-purple-700 border-purple-200",
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export default function AIFeedbackPanel({ responseId, taskType, score, maxScore, onClose }: AIFeedbackPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    breakdown: true,
    errors: false,
    tips: true,
    model: false,
  });

  const getTaskFeedback = trpc.aiCoach.getTaskFeedback.useMutation();

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const handleGetFeedback = () => {
    if (!getTaskFeedback.data && !getTaskFeedback.isPending) {
      getTaskFeedback.mutate({ responseId });
    }
  };

  const feedback = getTaskFeedback.data;
  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold">AI Coach Feedback</p>
              <p className="text-teal-100 text-xs">{taskType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Score badge */}
            <div className="text-right">
              <p className="text-teal-100 text-xs">Your Score</p>
              <p className="text-white font-extrabold text-xl">{score}<span className="text-teal-200 text-sm">/{maxScore}</span></p>
            </div>
            {onClose && (
              <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Score progress bar */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                scorePercent >= 80 ? "bg-emerald-500" :
                scorePercent >= 65 ? "bg-blue-500" :
                scorePercent >= 50 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700">{scorePercent}%</span>
        </div>
      </div>

      <div className="p-5">
        {!feedback && !getTaskFeedback.isPending && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Get Detailed AI Feedback</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Our AI coach will analyze your response and provide specific, actionable feedback to help you improve.
            </p>
            <button
              onClick={handleGetFeedback}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
            >
              <Brain className="w-4 h-4" />
              Analyze My Response
            </button>
          </div>
        )}

        {getTaskFeedback.isPending && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="font-semibold text-gray-700">AI is analyzing your response...</p>
            <p className="text-sm text-gray-500 mt-1">This takes about 5-10 seconds</p>
          </div>
        )}

        {feedback && (
          <div className="space-y-4">
            {/* Overall Band */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${BAND_COLORS[feedback.overallBand]}`}>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <div>
                  <p className="font-bold text-sm">Overall Band: {feedback.overallBand}</p>
                  <p className="text-xs opacity-80">Estimated: {feedback.estimatedScoreRange.min}–{feedback.estimatedScoreRange.max} / 90</p>
                </div>
              </div>
              <div className="text-2xl font-extrabold">{scorePercent}%</div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{feedback.detailedFeedback}</p>
            </div>

            {/* Score Breakdown */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle("breakdown")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-sm text-gray-800">Score Breakdown</span>
                </div>
                {expanded.breakdown ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.breakdown && (
                <div className="p-4 space-y-3">
                  {feedback.scoreBreakdown.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{item.criterion}</span>
                        <span className="text-xs font-bold text-gray-900">{item.score}/{item.maxScore}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${
                            item.score / item.maxScore >= 0.8 ? "bg-emerald-500" :
                            item.score / item.maxScore >= 0.6 ? "bg-blue-500" :
                            item.score / item.maxScore >= 0.4 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{item.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specific Errors */}
            {feedback.specificErrors.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle("errors")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm text-gray-800">Specific Errors ({feedback.specificErrors.length})</span>
                  </div>
                  {expanded.errors ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {expanded.errors && (
                  <div className="p-4 space-y-4">
                    {feedback.specificErrors.map((err, i) => (
                      <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{err.type}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">You wrote:</p>
                            <p className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-mono">{err.example}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Should be:</p>
                            <p className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded font-mono">{err.correction}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Improvement Tips */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle("tips")}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-sm text-gray-800">Improvement Tips ({feedback.improvementTips.length})</span>
                </div>
                {expanded.tips ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {expanded.tips && (
                <div className="p-4 space-y-3">
                  {feedback.improvementTips.map((tip, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[tip.priority]}`}>
                          {tip.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-xs font-semibold text-gray-700">{tip.skill}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{tip.tip}</p>
                      <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                        <p className="text-xs text-teal-700">
                          <span className="font-semibold">Practice Exercise: </span>
                          {tip.practiceExercise}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Model Answers (Band 65 / 79 / 90) */}
            {feedback.modelAnswers && feedback.modelAnswers.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle("model")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-sm text-gray-800">Model Answers (Band 65 / 79 / 90)</span>
                  </div>
                  {expanded.model ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                {expanded.model && (
                  <div className="p-4 space-y-3">
                    {feedback.modelAnswers.map((ma, i) => (
                      <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">Band {ma.band}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">{ma.response}</p>
                        <p className="text-xs text-purple-600 italic">{ma.commentary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-teal-600" />
                <p className="font-semibold text-sm text-teal-800">Next Steps</p>
              </div>
              <ul className="space-y-2">
                {feedback.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-teal-700">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
