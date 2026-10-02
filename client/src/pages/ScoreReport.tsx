import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useParams } from "wouter";
import { Link } from "wouter";
import {
  Trophy, ArrowRight, BarChart3, CheckCircle, AlertCircle,
  TrendingUp, TrendingDown, Minus, Download, Share2,
  Mic, PenLine, Eye, Headphones, Brain, BookOpen
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = ((score - 10) / 80) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 32 * pct / 100} ${2 * Math.PI * 32}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold text-foreground">{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

const enablingSkillColors: Record<string, string> = {
  grammar: "#6366f1",
  oral_fluency: "#3b82f6",
  pronunciation: "#06b6d4",
  spelling: "#10b981",
  vocabulary: "#f59e0b",
  written_discourse: "#8b5cf6",
  reading_skills: "#22c55e",
  listening_skills: "#f97316",
};

const enablingSkillLabels: Record<string, string> = {
  grammar: "Grammar",
  oral_fluency: "Oral Fluency",
  pronunciation: "Pronunciation",
  spelling: "Spelling",
  vocabulary: "Vocabulary",
  written_discourse: "Written Discourse",
  reading_skills: "Reading",
  listening_skills: "Listening",
};

export default function ScoreReport() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId);

  const { data: report, isLoading } = trpc.sessions.getReport.useQuery({ id: sessionId });

  if (isLoading) {
    return (
      <PTELayout title="Score Report">
        <div className="max-w-4xl space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PTELayout>
    );
  }

  if (!report) {
    return (
      <PTELayout title="Score Report">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Score report not found.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </PTELayout>
    );
  }

  const communicativeScores = [
    { label: "Listening", score: report.listeningScore, icon: Headphones, color: "#f97316" },
    { label: "Reading", score: report.readingScore, icon: Eye, color: "#22c55e" },
    { label: "Speaking", score: report.speakingScore, icon: Mic, color: "#3b82f6" },
    { label: "Writing", score: report.writingScore, icon: PenLine, color: "#8b5cf6" },
  ];

  const enablingSkills = report.enablingSkills || {};
  const radarData = Object.entries(enablingSkills).map(([key, value]) => ({
    skill: enablingSkillLabels[key] || key,
    score: value as number,
    fullMark: 90,
  }));

  const barData = communicativeScores.map(({ label, score, color }) => ({
    name: label,
    score: score ? Math.round(score) : 0,
    color,
  }));

  const getScoreBand = (score: number) => {
    if (score >= 79) return { label: "Expert", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 65) return { label: "Advanced", color: "text-blue-600", bg: "bg-blue-100" };
    if (score >= 50) return { label: "Upper Intermediate", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (score >= 36) return { label: "Intermediate", color: "text-orange-600", bg: "bg-orange-100" };
    return { label: "Developing", color: "text-red-600", bg: "bg-red-100" };
  };

  const overallBand = getScoreBand(report.overallScore || 0);

  return (
    <PTELayout title="Score Report">
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">PTE Academic Score Report</span>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                {report.completedAt ? new Date(report.completedAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric"
                }) : "Recent session"}
              </p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${overallBand.bg} ${overallBand.color}`}>
                {overallBand.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-6xl font-extrabold">{report.overallScore ? Math.round(report.overallScore) : "—"}</div>
              <div className="text-primary-foreground/70 text-sm">Overall Score</div>
              <div className="text-primary-foreground/50 text-xs">(10–90 scale)</div>
            </div>
          </div>
        </div>

        {/* Communicative Skills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Communicative Skills Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {communicativeScores.map(({ label, score, color }) => (
                <ScoreCircle key={label} score={score || 10} label={label} color={color} />
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 90]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}`, "Score"]} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enabling Skills */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Enabling Skills Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {Object.entries(enablingSkills).map(([key, value]) => {
                    const score = value as number;
                    const pct = ((score - 10) / 80) * 100;
                    const color = enablingSkillColors[key] || "#6366f1";
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">{enablingSkillLabels[key] || key}</span>
                          <span className="font-semibold">{Math.round(score)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diagnostic feedback */}
        {report.diagnosticFeedback && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Diagnostic Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{report.diagnosticFeedback}</p>
            </CardContent>
          </Card>
        )}

        {/* Improvement plan */}
        {report.improvementPlan && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Personalized Improvement Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{report.improvementPlan}</p>
            </CardContent>
          </Card>
        )}

        {/* Task responses */}
        {report.responses && report.responses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Task-by-Task Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.responses.map((resp: any, idx: number) => (
                  <div key={resp.id} className="p-3 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {resp.question?.taskType?.replace(/_/g, " ") || "Task"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {resp.normalizedScore !== null && resp.normalizedScore !== undefined ? (
                          <span className="text-sm font-bold text-foreground">{Math.round(resp.normalizedScore)}</span>
                        ) : resp.isCorrect !== null ? (
                          resp.isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )
                        ) : null}
                      </div>
                    </div>
                    {resp.feedback && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{resp.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-6">
          <Button asChild variant="outline">
            <Link href="/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Progress Analytics
            </Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground">
            <Link href="/practice">
              Continue Practicing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </PTELayout>
  );
}
