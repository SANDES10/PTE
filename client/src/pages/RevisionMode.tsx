import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PTELayout from "@/components/PTELayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  Brain, RotateCcw, CheckCircle, XCircle, Clock,
  TrendingUp, Flame, Target, ChevronRight, BookOpen,
  Zap, AlertCircle, BarChart2, Calendar, RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SrsRating = 1 | 2 | 3 | 4 | 5;

interface RatingConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  key: string;
}

const RATINGS: Record<SrsRating, RatingConfig> = {
  1: { label: "Again", color: "#ef4444", bg: "bg-red-50", border: "border-red-300", description: "Completely forgot", key: "1" },
  2: { label: "Hard", color: "#f97316", bg: "bg-orange-50", border: "border-orange-300", description: "Recalled with difficulty", key: "2" },
  3: { label: "Good", color: "#3b82f6", bg: "bg-blue-50", border: "border-blue-300", description: "Recalled correctly", key: "3" },
  4: { label: "Easy", color: "#10b981", bg: "bg-emerald-50", border: "border-emerald-300", description: "Recalled easily", key: "4" },
  5: { label: "Perfect", color: "#0d9488", bg: "bg-teal-50", border: "border-teal-300", description: "Perfect recall", key: "5" },
};

const SECTION_COLORS: Record<string, string> = {
  speaking: "#3b82f6",
  writing: "#8b5cf6",
  reading: "#10b981",
  listening: "#f97316",
};

const TASK_LABELS: Record<string, string> = {
  read_aloud: "Read Aloud",
  repeat_sentence: "Repeat Sentence",
  describe_image: "Describe Image",
  retell_lecture: "Re-tell Lecture",
  answer_short_question: "Answer Short Question",
  summarize_written_text: "Summarize Written Text",
  write_essay: "Write Essay",
  multiple_choice_single: "Multiple Choice (Single)",
  multiple_choice_multiple: "Multiple Choice (Multiple)",
  reorder_paragraphs: "Re-order Paragraphs",
  fill_blanks_reading: "Fill in the Blanks (R)",
  fill_blanks_rw: "Fill in the Blanks (R&W)",
  summarize_spoken_text: "Summarize Spoken Text",
  fill_blanks_listening: "Fill in the Blanks (L)",
  highlight_correct_summary: "Highlight Correct Summary",
  select_missing_word: "Select Missing Word",
  highlight_incorrect_words: "Highlight Incorrect Words",
  write_from_dictation: "Write from Dictation",
};

// ─── Stats Panel ──────────────────────────────────────────────────────────────

function StatsPanel() {
  const { data: stats, isLoading } = trpc.srs.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const retentionColor = stats.retentionRate >= 80 ? "#10b981" : stats.retentionRate >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs text-gray-500 font-medium">Due Today</span>
        </div>
        <div className="text-2xl font-black" style={{ color: stats.dueNow > 0 ? "#ef4444" : "#10b981" }}>
          {stats.dueNow}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">cards to review</div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-teal-500" />
          <span className="text-xs text-gray-500 font-medium">Reviewed Today</span>
        </div>
        <div className="text-2xl font-black text-teal-600">{stats.reviewedToday}</div>
        <div className="text-xs text-gray-400 mt-0.5">sessions done</div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-500 font-medium">Total Cards</span>
        </div>
        <div className="text-2xl font-black text-purple-600">{stats.totalCards}</div>
        <div className="text-xs text-gray-400 mt-0.5">in your deck</div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4" style={{ color: retentionColor }} />
          <span className="text-xs text-gray-500 font-medium">Retention</span>
        </div>
        <div className="text-2xl font-black" style={{ color: retentionColor }}>
          {stats.retentionRate}%
        </div>
        <div className="text-xs text-gray-400 mt-0.5">correct recall rate</div>
      </div>
    </div>
  );
}

// ─── Review Heatmap ───────────────────────────────────────────────────────────

function ReviewHeatmap({ logs }: { logs: Array<{ reviewedAt: Date; rating: number }> }) {
  const today = new Date();
  const days: Array<{ date: string; count: number; avgRating: number }> = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    const dayLogs = logs.filter(l => new Date(l.reviewedAt).toISOString().split("T")[0] === dateStr);
    const avgRating = dayLogs.length > 0 ? dayLogs.reduce((s, l) => s + l.rating, 0) / dayLogs.length : 0;
    days.push({ date: dateStr, count: dayLogs.length, avgRating });
  }

  const getColor = (count: number, avgRating: number) => {
    if (count === 0) return "#f1f5f9";
    if (avgRating >= 4) return "#0d9488";
    if (avgRating >= 3) return "#3b82f6";
    if (avgRating >= 2) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">14-Day Review Activity</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          {["#f1f5f9", "#ef4444", "#f59e0b", "#3b82f6", "#0d9488"].map((c, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex-1 h-8 rounded-md cursor-pointer transition-transform hover:scale-110"
            style={{ background: getColor(day.count, day.avgRating) }}
            title={`${day.date}: ${day.count} reviews${day.count > 0 ? `, avg rating ${day.avgRating.toFixed(1)}` : ""}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>14 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

// ─── Card Deck ────────────────────────────────────────────────────────────────

interface DeckCard {
  card: {
    id: number;
    easeFactor: number;
    interval: number;
    repetitions: number;
    lapses: number;
    state: "new" | "learning" | "review" | "relearning";
    dueDate: Date;
    totalReviews: number;
    correctReviews: number;
    lastScore: number | null;
  };
  question: {
    id: number;
    section: string;
    taskType: string;
    difficulty: string;
    title: string;
    prompt: string | null;
    content: string | null;
    options: unknown;
    correctAnswer: string | null;
    modelAnswer: string | null;
  };
  intervalPreviews: Record<string, string>;
}

function CardDeck() {
  const utils = trpc.useUtils();
  const { data: dueCards, isLoading, refetch } = trpc.srs.getDueCards.useQuery({ limit: 20 });
  const recordReview = trpc.srs.recordReview.useMutation({
    onSuccess: () => utils.srs.getStats.invalidate(),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, again: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const cards = dueCards ?? [];
  const currentCard = cards[currentIndex] as DeckCard | undefined;

  const handleFlip = useCallback(() => {
    if (!isFlipped) setIsFlipped(true);
  }, [isFlipped]);

  const handleRate = useCallback(async (rating: SrsRating) => {
    if (!currentCard || isAnimating) return;

    setIsAnimating(true);

    try {
      await recordReview.mutateAsync({
        cardId: currentCard.card.id,
        rating,
        responseText: userAnswer || undefined,
      });

      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: rating >= 3 ? prev.correct + 1 : prev.correct,
        again: rating === 1 ? prev.again + 1 : prev.again,
      }));

      const ratingConfig = RATINGS[rating];
      toast.success(`${ratingConfig.label} — next review in ${currentCard.intervalPreviews[rating]}`, {
        duration: 2000,
      });

      setTimeout(() => {
        if (currentIndex + 1 >= cards.length) {
          setSessionComplete(true);
        } else {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
          setUserAnswer("");
        }
        setIsAnimating(false);
      }, 300);
    } catch {
      toast.error("Failed to record review");
      setIsAnimating(false);
    }
  }, [currentCard, isAnimating, recordReview, userAnswer, currentIndex, cards.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isFlipped) handleFlip();
      }
      if (isFlipped && !isAnimating) {
        if (e.key === "1") handleRate(1);
        if (e.key === "2") handleRate(2);
        if (e.key === "3") handleRate(3);
        if (e.key === "4") handleRate(4);
        if (e.key === "5") handleRate(5);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFlipped, isAnimating, handleFlip, handleRate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your review deck...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0 || sessionComplete) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {sessionComplete ? "Session Complete!" : "All Caught Up!"}
        </h3>
        <p className="text-gray-500 mb-6 text-sm">
          {sessionComplete
            ? `You reviewed ${sessionStats.reviewed} cards — ${sessionStats.correct} correct, ${sessionStats.again} to revisit.`
            : "No cards are due for review right now. Come back later or add cards from your practice sessions."}
        </p>

        {sessionComplete && (
          <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto">
            <div className="bg-teal-50 rounded-xl p-3">
              <div className="text-xl font-black text-teal-600">{sessionStats.reviewed}</div>
              <div className="text-xs text-teal-500">Reviewed</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-xl font-black text-blue-600">{sessionStats.correct}</div>
              <div className="text-xs text-blue-500">Correct</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="text-xl font-black text-red-600">{sessionStats.again}</div>
              <div className="text-xs text-red-500">Again</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionComplete(false);
              setSessionStats({ reviewed: 0, correct: 0, again: 0 });
              refetch();
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Deck
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.round((currentIndex / cards.length) * 100);
  const sectionColor = SECTION_COLORS[currentCard?.question.section ?? ""] ?? "#6b7280";

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span className="text-sm text-gray-400">
          {cards.length - currentIndex - 1} remaining
        </span>
      </div>
      <Progress value={progress} className="h-2 mb-5" />

      {/* Card */}
      <div
        className={`relative bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-300 ${isFlipped ? "border-teal-300" : "border-gray-200 cursor-pointer hover:border-teal-200 hover:shadow-md"}`}
        onClick={!isFlipped ? handleFlip : undefined}
        style={{ minHeight: "320px" }}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
              style={{ background: sectionColor }}
            >
              {currentCard?.question.section.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {TASK_LABELS[currentCard?.question.taskType ?? ""] ?? currentCard?.question.taskType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(currentCard?.card.lapses ?? 0) > 0 && (
              <span className="text-xs bg-red-50 text-red-500 font-medium px-2 py-0.5 rounded-full border border-red-200">
                {currentCard?.card.lapses}× lapsed
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              currentCard?.card.state === "new" ? "bg-blue-50 text-blue-600 border border-blue-200" :
              currentCard?.card.state === "learning" ? "bg-yellow-50 text-yellow-600 border border-yellow-200" :
              currentCard?.card.state === "relearning" ? "bg-orange-50 text-orange-600 border border-orange-200" :
              "bg-green-50 text-green-600 border border-green-200"
            }`}>
              {currentCard?.card.state}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6">
          {/* Question side (always visible) */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Question</div>
            <h3 className="text-base font-bold text-gray-800 mb-3">{currentCard?.question.title}</h3>
            {currentCard?.question.prompt && (
              <p className="text-sm text-gray-600 mb-3 italic">{currentCard.question.prompt}</p>
            )}
            {currentCard?.question.content && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
                {currentCard.question.content.length > 400
                  ? currentCard.question.content.slice(0, 400) + "..."
                  : currentCard.question.content}
              </div>
            )}
          </div>

          {/* Answer input (shown before flip) */}
          {!isFlipped && (
            <div className="mt-4">
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Type your answer here (optional)..."
                className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 text-gray-700 placeholder-gray-300"
                rows={3}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">Press Space or Enter to reveal answer</span>
                <Button
                  onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm h-9"
                >
                  Show Answer <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Answer side (shown after flip) */}
          {isFlipped && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
                ✓ Model Answer
              </div>
              <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800 leading-relaxed border border-teal-200">
                {currentCard?.question.modelAnswer ?? currentCard?.question.correctAnswer ?? "See task instructions for the correct approach."}
              </div>

              {/* Previous score */}
              {currentCard?.card.lastScore !== null && currentCard?.card.lastScore !== undefined && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Your previous score on this question: <strong className="text-gray-700">{Math.round(currentCard.card.lastScore)}/90</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating buttons (shown after flip) */}
      {isFlipped && (
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-xs text-center text-gray-400 mb-3">
            How well did you recall this? (keyboard: 1–5)
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(RATINGS) as Array<[string, RatingConfig]>).map(([ratingStr, config]) => {
              const rating = parseInt(ratingStr) as SrsRating;
              const preview = currentCard?.intervalPreviews[ratingStr] ?? "?";
              return (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  disabled={isAnimating}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${config.bg} ${config.border}`}
                >
                  <span className="text-sm font-bold" style={{ color: config.color }}>{config.label}</span>
                  <span className="text-xs text-gray-500">{preview}</span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">{config.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Cards ───────────────────────────────────────────────────────────

function UpcomingCards() {
  const { data: upcoming, isLoading } = trpc.srs.getUpcomingCards.useQuery({ limit: 8 });

  if (isLoading || !upcoming || upcoming.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Upcoming Reviews</span>
      </div>
      <div className="space-y-2">
        {upcoming.map(({ card, question }) => {
          const dueDate = new Date(card.dueDate);
          const now = new Date();
          const diffMs = dueDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const sectionColor = SECTION_COLORS[question.section] ?? "#6b7280";

          return (
            <div key={card.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sectionColor }} />
                <span className="text-sm text-gray-700 truncate">{question.title}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400">
                  {diffDays === 1 ? "tomorrow" : `in ${diffDays}d`}
                </span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {card.state}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── State Distribution ───────────────────────────────────────────────────────

function StateDistribution({ byState }: { byState: Record<string, number> }) {
  const total = Object.values(byState).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const states = [
    { key: "new", label: "New", color: "#3b82f6" },
    { key: "learning", label: "Learning", color: "#f59e0b" },
    { key: "review", label: "Review", color: "#10b981" },
    { key: "relearning", label: "Relearning", color: "#f97316" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-700">Deck Composition</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-0.5">
        {states.map(({ key, color }) => {
          const count = byState[key] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              style={{ width: `${pct}%`, background: color }}
              title={`${key}: ${count}`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {states.map(({ key, label, color }) => {
          const count = byState[key] ?? 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-gray-600">{label}</span>
              <span className="text-xs font-bold text-gray-800 ml-auto">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RevisionMode() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stats } = trpc.srs.getStats.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <PTELayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </PTELayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PTELayout>
        <div className="max-w-md mx-auto text-center py-16">
          <Brain className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sign in to use Revision Mode</h2>
          <p className="text-gray-500 text-sm mb-6">Your spaced repetition deck is saved to your account.</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </PTELayout>
    );
  }

  return (
    <PTELayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Revision Mode</h1>
              <p className="text-xs text-gray-500">SM-2 Spaced Repetition — review cards at the optimal moment</p>
            </div>
          </div>
        </div>

        {/* How it works banner */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <span className="text-gray-700">Practice any task — cards auto-created when you score below 65</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <span className="text-gray-700">Review due cards — read the question, attempt your answer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <span className="text-gray-700">Rate recall (1–5) — SM-2 schedules the next review automatically</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Card deck */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <StatsPanel />

            {/* Heatmap */}
            {stats?.recentLogs && stats.recentLogs.length > 0 && (
              <ReviewHeatmap logs={stats.recentLogs.map(l => ({ reviewedAt: new Date(l.reviewedAt), rating: l.rating }))} />
            )}

            {/* Card deck */}
            <CardDeck />
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">
            {/* SM-2 explanation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">How SM-2 Works</span>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-500 font-bold text-[10px]">1</span>
                  </div>
                  <span><strong>Again</strong> — card resets to day 1, ease factor drops</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-500 font-bold text-[10px]">2</span>
                  </div>
                  <span><strong>Hard</strong> — interval increases slowly, ease factor drops slightly</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-500 font-bold text-[10px]">3</span>
                  </div>
                  <span><strong>Good</strong> — interval multiplied by ease factor (~2.5×)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-500 font-bold text-[10px]">4</span>
                  </div>
                  <span><strong>Easy</strong> — interval grows faster, ease factor increases</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-500 font-bold text-[10px]">5</span>
                  </div>
                  <span><strong>Perfect</strong> — maximum interval growth, highest ease boost</span>
                </div>
              </div>
            </div>

            {/* Rating scale */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-semibold text-gray-700">Rating Guide</span>
              </div>
              <div className="space-y-1.5">
                {(Object.entries(RATINGS) as Array<[string, RatingConfig]>).map(([r, cfg]) => (
                  <div key={r} className="flex items-center gap-2">
                    <kbd className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono">{r}</kbd>
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                    <span className="text-xs text-gray-400">— {cfg.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming + deck composition */}
            {stats && <StateDistribution byState={stats.byState} />}
            <UpcomingCards />
          </div>
        </div>
      </div>
    </PTELayout>
  );
}
