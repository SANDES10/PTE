import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap, Clock, Mic, PenLine, Eye, Headphones,
  ChevronRight, Info, AlertCircle, CheckCircle, Play
} from "lucide-react";

const mockTestSections = [
  {
    section: "speaking",
    label: "Speaking & Writing",
    icon: Mic,
    color: "bg-blue-500",
    duration: "77–93 min",
    tasks: [
      { type: "read_aloud", label: "Read Aloud", count: "6–7", time: "35–40s" },
      { type: "repeat_sentence", label: "Repeat Sentence", count: "10–12", time: "15s" },
      { type: "describe_image", label: "Describe Image", count: "6–7", time: "40s" },
      { type: "retell_lecture", label: "Re-tell Lecture", count: "3–4", time: "40s" },
      { type: "answer_short_question", label: "Answer Short Question", count: "5–6", time: "10s" },
    ],
  },
  {
    section: "writing",
    label: "Writing",
    icon: PenLine,
    color: "bg-purple-500",
    duration: "Included above",
    tasks: [
      { type: "summarize_written_text", label: "Summarize Written Text", count: "1–2", time: "10 min" },
      { type: "write_essay", label: "Write Essay", count: "1–2", time: "20 min" },
    ],
  },
  {
    section: "reading",
    label: "Reading",
    icon: Eye,
    color: "bg-green-500",
    duration: "29–30 min",
    tasks: [
      { type: "fill_blanks_rw", label: "Fill in the Blanks (R&W)", count: "5–6", time: "2 min" },
      { type: "multiple_choice_multiple", label: "Multiple Choice (Multiple)", count: "2–3", time: "2.5 min" },
      { type: "reorder_paragraphs", label: "Re-order Paragraphs", count: "2–3", time: "2 min" },
      { type: "fill_blanks_reading", label: "Fill in the Blanks", count: "4–5", time: "2 min" },
      { type: "multiple_choice_single", label: "Multiple Choice (Single)", count: "1–2", time: "2 min" },
    ],
  },
  {
    section: "listening",
    label: "Listening",
    icon: Headphones,
    color: "bg-orange-500",
    duration: "30–43 min",
    tasks: [
      { type: "summarize_spoken_text", label: "Summarize Spoken Text", count: "2–3", time: "10 min" },
      { type: "multiple_choice_multiple", label: "Multiple Choice (Multiple)", count: "2–3", time: "2 min" },
      { type: "fill_blanks_listening", label: "Fill in the Blanks", count: "2–3", time: "2 min" },
      { type: "highlight_correct_summary", label: "Highlight Correct Summary", count: "2–3", time: "1.5 min" },
      { type: "multiple_choice_single", label: "Multiple Choice (Single)", count: "2–3", time: "1.5 min" },
      { type: "select_missing_word", label: "Select Missing Word", count: "2–3", time: "1 min" },
      { type: "highlight_incorrect_words", label: "Highlight Incorrect Words", count: "2–3", time: "2 min" },
      { type: "write_from_dictation", label: "Write from Dictation", count: "3–4", time: "30s" },
    ],
  },
];

export default function MockTest() {
  const [started, setStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"full" | "section">("full");
  const [selectedSection, setSelectedSection] = useState<string>("speaking");
  const createSession = trpc.sessions.create.useMutation();

  const startMockTest = async () => {
    try {
      const session = await createSession.mutateAsync({
        sessionType: selectedMode === "full" ? "mock_test" : "section_practice",
        section: selectedMode === "section" ? selectedSection as any : undefined,
        mode: "exam",
        totalQuestions: selectedMode === "full" ? 20 : 5,
      });
      // Navigate to first question
      window.location.href = `/session/${session.id}?mode=exam&mockTest=true`;
    } catch {
      toast.error("Failed to start mock test");
    }
  };

  return (
    <PTELayout title="Mock Test">
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">PTE Academic Mock Test</h2>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                Simulate the real PTE Academic exam experience with timed sections, AI scoring, and a full score report
                aligned with the official PTE scoring criteria.
              </p>
            </div>
          </div>
        </div>

        {/* Test mode selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Test Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode("full")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMode === "full" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Full Mock Test</span>
                  {selectedMode === "full" && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <p className="text-xs text-muted-foreground">All sections with real exam timing. ~3 hours total.</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  ~3 hours
                </div>
              </button>
              <button
                onClick={() => setSelectedMode("section")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedMode === "section" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Section Practice</span>
                  {selectedMode === "section" && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                </div>
                <p className="text-xs text-muted-foreground">Practice one section at a time with exam conditions.</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  30–90 min
                </div>
              </button>
            </div>

            {selectedMode === "section" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {["speaking", "writing", "reading", "listening"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSection(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      selectedSection === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exam info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Important Information</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• This is a PTE-style simulation, not the official Pearson PTE Academic exam.</li>
              <li>• Scores are AI-estimated and aligned with official PTE scoring descriptors.</li>
              <li>• Speaking tasks require microphone access. Please allow it when prompted.</li>
              <li>• Ensure a quiet environment for speaking and listening tasks.</li>
            </ul>
          </div>
        </div>

        {/* Section overview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Test Structure</h3>
          {mockTestSections.map(({ section, label, icon: Icon, color, duration, tasks }) => (
            <Card key={section}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-sm">{label}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {duration}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tasks.map((task) => (
                    <div key={task.type} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <span className="text-xs text-foreground">{task.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{task.count}</Badge>
                        <span className="text-xs text-muted-foreground">{task.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Start button */}
        <div className="flex justify-center pb-6">
          <Button
            size="lg"
            onClick={startMockTest}
            disabled={createSession.isPending}
            className="bg-primary text-primary-foreground px-10 text-base"
          >
            {createSession.isPending ? "Starting..." : (
              <>
                Start {selectedMode === "full" ? "Full Mock Test" : `${selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Section`}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </PTELayout>
  );
}
