import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";
import { Settings, Target, Bell, User, Save, Trophy, Clock } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { data: analytics } = trpc.analytics.myStats.useQuery();
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => toast.success("Profile updated!"),
    onError: () => toast.error("Failed to update profile"),
  });
  const generateTarget = trpc.analytics.generateTarget.useMutation({
    onSuccess: () => toast.success("Daily practice target set!"),
    onError: () => toast.error("Failed to set target"),
  });

  const [targetScore, setTargetScore] = useState(65);
  const [dailyGoal, setDailyGoal] = useState(30);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [notifications, setNotifications] = useState(true);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const handleSave = () => {
    updateProfile.mutate({ targetScore, dailyGoalMinutes: dailyGoal, currentLevel: level, notificationsEnabled: notifications });
  };

  const handleSetDailyTarget = () => {
    generateTarget.mutate({ targetMinutes: dailyGoal });
  };

  return (
    <PTELayout title="Profile & Settings">
      <div className="max-w-2xl space-y-6">
        {/* User info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user?.name || "User"}</h2>
                <p className="text-muted-foreground text-sm">{user?.email || ""}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {analytics?.totalSessions || 0} sessions completed
                  </span>
                  {analytics?.avgScore && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      Avg. score: {Math.round(analytics.avgScore)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Score Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Target PTE Score: <span className="text-primary font-bold">{targetScore}</span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10</span>
                <span>50 (Intermediate)</span>
                <span>65 (Advanced)</span>
                <span>90</span>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                {targetScore >= 79 ? "Expert level — required for top universities and professional registration." :
                 targetScore >= 65 ? "Advanced level — required by most top universities for postgraduate programs." :
                 targetScore >= 50 ? "Upper Intermediate — required by many universities for undergraduate admission." :
                 "Intermediate level — suitable for some vocational and community college programs."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily goal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Daily Practice Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Daily practice time: <span className="text-primary font-bold">{dailyGoal} minutes</span>
              </label>
              <input
                type="range"
                min={10}
                max={120}
                step={5}
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10 min</span>
                <span>30 min</span>
                <span>60 min</span>
                <span>120 min</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSetDailyTarget} disabled={generateTarget.isPending}>
              Set Today's Target
            </Button>
          </CardContent>
        </Card>

        {/* Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                    level === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Practice Reminders</p>
                <p className="text-xs text-muted-foreground">Get notified to practice daily</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${notifications ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${notifications ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full bg-primary text-primary-foreground"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateProfile.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </PTELayout>
  );
}
