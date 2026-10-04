import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  GraduationCap, Zap, Search, RotateCcw, ArrowRight, CheckCircle,
  Clock, Target, BookOpen, Brain, TrendingUp, Info
} from "lucide-react";

const modes = [
  {
    id: "beginner",
    label: "Beginner Mode",
    icon: GraduationCap,
    color: "bg-green-500",
    description: "Guided practice with templates, hints, and model answers to help you understand each task type.",
    features: [
      "Step-by-step task guidance",
      "Model answers for reference",
      "No strict time limits",
      "Detailed explanations for each task type",
      "Vocabulary and grammar tips",
    ],
    badge: "Recommended for Starters",
    badgeColor: "bg-green-100 text-green-700",
    section: "speaking",
    sessionType: "beginner",
  },
  {
    id: "exam",
    label: "Exam Mode",
    icon: Zap,
    color: "bg-blue-500",
    description: "Strict exam conditions with real PTE timing, no hints, and AI scoring aligned with official criteria.",
    features: [
      "Real PTE exam timing",
      "No hints or model answers",
      "AI scoring on all criteria",
      "Automatic submission on timeout",
      "Full score report after completion",
    ],
    badge: "Exam Simulation",
    badgeColor: "bg-blue-100 text-blue-700",
    section: "speaking",
    sessionType: "section_practice",
  },
  {
    id: "diagnostic",
    label: "Diagnostic Mode",
    icon: Search,
    color: "bg-purple-500",
    description: "Identifies your weak areas across all skills with a comprehensive diagnostic report and action plan.",
    features: [
      "Covers all task types",
      "Detailed skill-by-skill analysis",
      "Identifies score-limiting skills",
      "Personalized action plan",
      "Recommended practice schedule",
    ],
    badge: "Weakness Detection",
    badgeColor: "bg-purple-100 text-purple-700",
    section: "full",
    sessionType: "diagnostic",
  },
  {
    id: "revision",
    label: "Revision Mode",
    icon: RotateCcw,
    color: "bg-orange-500",
    description: "Focuses on high-impact tasks and your previously identified weak areas for maximum score improvement.",
    features: [
      "Targets your weak skills",
      "High-frequency exam tasks",
      "Spaced repetition approach",
      "Score improvement tracking",
      "Focused feedback on problem areas",
    ],
    badge: "Score Improvement",
    badgeColor: "bg-orange-100 text-orange-700",
    section: "speaking",
    sessionType: "revision",
  },
];

const taskGuides = [
  {
    taskType: "read_aloud",
    label: "Read Aloud",
    section: "Speaking",
    tips: [
      "Read at a natural, conversational pace — not too fast or slow.",
      "Pronounce each word clearly, paying attention to word stress.",
      "Use natural intonation — rise at questions, fall at statements.",
      "If you mispronounce a word, keep going — don't stop to correct.",
      "Aim for 100–120 words per minute.",
    ],
    scoring: "Content (90 pts), Pronunciation (30 pts), Oral Fluency (30 pts)",
  },
  {
    taskType: "write_essay",
    label: "Write Essay",
    section: "Writing",
    tips: [
      "Structure: Introduction (1 para) → Body (2 paras) → Conclusion (1 para).",
      "Use linking words: Furthermore, However, In conclusion, Additionally.",
      "Aim for 200–300 words — staying in range affects Form score.",
      "Avoid repeating the same vocabulary — use synonyms.",
      "Check grammar: subject-verb agreement, article use, tense consistency.",
    ],
    scoring: "Content (3 pts), Form (2 pts), Grammar (2 pts), Vocabulary (2 pts), Spelling (2 pts), Written Discourse (2 pts)",
  },
  {
    taskType: "summarize_written_text",
    label: "Summarize Written Text",
    section: "Writing",
    tips: [
      "Write ONE sentence only — multiple sentences score zero on Form.",
      "Include the main idea and 1–2 key supporting points.",
      "Stay within 5–75 words.",
      "Use a complex sentence structure with subordinate clauses.",
      "Do not copy phrases directly — paraphrase the key ideas.",
    ],
    scoring: "Content (2 pts), Form (1 pt), Grammar (2 pts), Vocabulary (2 pts), Spelling (2 pts)",
  },
  {
    taskType: "describe_image",
    label: "Describe Image",
    section: "Speaking",
    tips: [
      "Start with an overview: 'This image shows a bar chart comparing...'",
      "Describe the main trend or key data points.",
      "Use comparative language: 'higher than', 'significantly more', 'while'.",
      "Mention specific values when visible.",
      "End with a conclusion about the overall pattern.",
    ],
    scoring: "Content (90 pts), Pronunciation (30 pts), Oral Fluency (30 pts)",
  },
];

export default function LearningModes() {
  const createSession = trpc.sessions.create.useMutation();

  const startMode = async (mode: typeof modes[0]) => {
    try {
      const session = await createSession.mutateAsync({
        sessionType: mode.sessionType as any,
        section: mode.section as any,
        mode: mode.id as any,
        totalQuestions: 5,
      });
      window.location.href = `/practice/${mode.section === "full" ? "speaking" : mode.section}?mode=${mode.id}`;
    } catch {
      toast.error("Failed to start session");
    }
  };

  return (
    <PTELayout title="Learning Modes">
      <div className="max-w-5xl space-y-8">
        {/* Modes grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Choose Your Learning Mode</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Card key={mode.id} className="hover:shadow-md transition-all hover:border-primary/30">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${mode.color} rounded-xl flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{mode.label}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${mode.badgeColor}`}>
                            {mode.badge}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{mode.description}</p>
                        <ul className="space-y-1 mb-4">
                          {mode.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button
                          size="sm"
                          onClick={() => startMode(mode)}
                          disabled={createSession.isPending}
                          className="w-full"
                        >
                          Start {mode.label}
                          <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Task type guides */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Task-Specific Guidance</h2>
          <div className="space-y-4">
            {taskGuides.map((guide) => (
              <Card key={guide.taskType}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{guide.label}</CardTitle>
                    <Badge variant="outline" className="text-xs">{guide.section}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Scoring: {guide.scoring}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* PTE Score Scale info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              PTE Academic Score Scale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { range: "79–90", label: "Expert", color: "bg-green-100 text-green-800 border-green-200" },
                { range: "65–78", label: "Advanced", color: "bg-blue-100 text-blue-800 border-blue-200" },
                { range: "50–64", label: "Upper Intermediate", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                { range: "36–49", label: "Intermediate", color: "bg-orange-100 text-orange-800 border-orange-200" },
                { range: "10–35", label: "Developing", color: "bg-red-100 text-red-800 border-red-200" },
              ].map(({ range, label, color }) => (
                <div key={range} className={`p-3 rounded-xl border text-center ${color}`}>
                  <div className="font-bold text-sm">{range}</div>
                  <div className="text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              The PTE Academic score scale ranges from 10 to 90. Most universities require 50–65+ for admission.
              Many top universities require 65–79 for postgraduate programs.
            </p>
          </CardContent>
        </Card>
      </div>
    </PTELayout>
  );
}
