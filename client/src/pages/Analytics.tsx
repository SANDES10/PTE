import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, BarChart3, Target, Trophy,
  Calendar, ArrowRight, Mic, PenLine, Eye, Headphones
} from "lucide-react";

const SECTION_COLORS = {
  speaking: "#3b82f6",
  writing: "#8b5cf6",
  reading: "#22c55e",
  listening: "#f97316",
};

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.analytics.myStats.useQuery();
  const { data: sessions } = trpc.sessions.myHistory.useQuery({ limit: 20 });
  const { data: milestones } = trpc.analytics.milestones.useQuery();

  // Build score trend data from sessions
  const trendData = sessions
    ?.filter(s => s.overallScore && s.completedAt)
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
    .map((s, i) => ({
      session: `#${i + 1}`,
      date: new Date(s.completedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      overall: s.overallScore ? Math.round(s.overallScore) : null,
      speaking: s.speakingScore ? Math.round(s.speakingScore) : null,
      writing: s.writingScore ? Math.round(s.writingScore) : null,
      reading: s.readingScore ? Math.round(s.readingScore) : null,
      listening: s.listeningScore ? Math.round(s.listeningScore) : null,
    })) || [];

  // Section performance averages
  const sectionAverages = sessions?.reduce((acc, s) => {
    if (s.speakingScore) { acc.speaking.push(s.speakingScore); }
    if (s.writingScore) { acc.writing.push(s.writingScore); }
    if (s.readingScore) { acc.reading.push(s.readingScore); }
    if (s.listeningScore) { acc.listening.push(s.listeningScore); }
    return acc;
  }, { speaking: [] as number[], writing: [] as number[], reading: [] as number[], listening: [] as number[] });

  const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const sectionBarData = sectionAverages ? [
    { name: "Speaking", score: avg(sectionAverages.speaking), color: SECTION_COLORS.speaking },
    { name: "Writing", score: avg(sectionAverages.writing), color: SECTION_COLORS.writing },
    { name: "Reading", score: avg(sectionAverages.reading), color: SECTION_COLORS.reading },
    { name: "Listening", score: avg(sectionAverages.listening), color: SECTION_COLORS.listening },
  ] : [];

  const latestScore = analytics?.latestSession?.overallScore;
  const prevScore = sessions && sessions.length >= 2 ? sessions[sessions.length - 2]?.overallScore : null;
  const scoreTrend = latestScore && prevScore ? latestScore - prevScore : null;

  if (isLoading) {
    return (
      <PTELayout title="Analytics">
        <div className="max-w-4xl space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </PTELayout>
    );
  }

  return (
    <PTELayout title="Analytics">
      <div className="max-w-5xl space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Sessions</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">{analytics?.totalSessions || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Avg. Score</span>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {analytics?.avgScore ? Math.round(analytics.avgScore) : "—"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Latest Score</span>
                {scoreTrend !== null ? (
                  scoreTrend > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                  scoreTrend < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                  <Minus className="w-4 h-4 text-muted-foreground" />
                ) : <Target className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {latestScore ? Math.round(latestScore) : "—"}
              </div>
              {scoreTrend !== null && (
                <p className={`text-xs mt-1 ${scoreTrend > 0 ? "text-green-600" : scoreTrend < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                  {scoreTrend > 0 ? "+" : ""}{Math.round(scoreTrend)} from last session
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Milestones</span>
                <Trophy className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{milestones?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Score trend chart */}
        {trendData.length > 1 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Score Trend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[10, 90]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="overall" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 4 }} name="Overall" />
                  <Line type="monotone" dataKey="speaking" stroke={SECTION_COLORS.speaking} strokeWidth={1.5} dot={false} name="Speaking" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="writing" stroke={SECTION_COLORS.writing} strokeWidth={1.5} dot={false} name="Writing" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="reading" stroke={SECTION_COLORS.reading} strokeWidth={1.5} dot={false} name="Reading" strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="listening" stroke={SECTION_COLORS.listening} strokeWidth={1.5} dot={false} name="Listening" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Complete at least 2 sessions to see your score trend.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/practice">Start Practicing</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Section averages */}
        {sectionBarData.some(d => d.score > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Average Score by Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 90]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}`, "Avg. Score"]} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {sectionBarData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Session history */}
        {sessions && sessions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === "completed" ? "bg-green-500" : "bg-yellow-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {session.sessionType?.replace(/_/g, " ")} — {session.section}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : "In progress"}
                          {" · "}{session.answeredQuestions || 0} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.overallScore && (
                        <span className="text-sm font-bold text-foreground">{Math.round(session.overallScore)}</span>
                      )}
                      {session.status === "completed" && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/score-report/${session.id}`}>
                            Report <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data state */}
        {(!sessions || sessions.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-2">No data yet</p>
              <p className="text-muted-foreground text-sm mb-4">
                Complete practice sessions to see your analytics and track your progress.
              </p>
              <Button asChild>
                <Link href="/practice">Start Practicing <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PTELayout>
  );
}
