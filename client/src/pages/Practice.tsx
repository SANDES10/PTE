import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams } from "wouter";
import { useState, useEffect } from "react";
import {
  Mic, PenLine, Eye, Headphones, ArrowRight, Clock,
  BookOpen, ChevronDown, Info, Star, Zap, Target,
  CheckCircle, Lock, Play, BarChart2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  {
    id: "speaking", label: "Speaking", icon: Mic,
    color: "bg-blue-500", textColor: "text-blue-600",
    borderColor: "border-blue-200", bgLight: "bg-blue-50",
    description: "7 task types · Oral fluency, pronunciation, content"
  },
  {
    id: "writing", label: "Writing", icon: PenLine,
    color: "bg-purple-500", textColor: "text-purple-600",
    borderColor: "border-purple-200", bgLight: "bg-purple-50",
    description: "2 task types · Grammar, vocabulary, written discourse"
  },
  {
    id: "reading", label: "Reading", icon: Eye,
    color: "bg-green-500", textColor: "text-green-600",
    borderColor: "border-green-200", bgLight: "bg-green-50",
    description: "5 task types · Comprehension, vocabulary, structure"
  },
  {
    id: "listening", label: "Listening", icon: Headphones,
    color: "bg-orange-500", textColor: "text-orange-600",
    borderColor: "border-orange-200", bgLight: "bg-orange-50",
    description: "8 task types · Comprehension, note-taking, dictation"
  },
];

// Official PTE Academic task type ordering for each section
const SECTION_TASK_ORDER: Record<string, string[]> = {
  speaking: [
    "read_aloud",
    "repeat_sentence",
    "describe_image",
    "retell_lecture",
    "answer_short_question",
    "respond_to_situation",
    "summarize_group_discussion",
  ],
  writing: [
    "summarize_written_text",
    "write_essay",
  ],
  reading: [
    "multiple_choice_single",
    "multiple_choice_multiple",
    "reorder_paragraphs",
    "fill_blanks_reading",
    "fill_blanks_rw",
  ],
  listening: [
    "summarize_spoken_text",
    "multiple_choice_single_listening",
    "multiple_choice_multiple_listening",
    "fill_blanks_listening",
    "highlight_correct_summary",
    "write_from_dictation",
    "highlight_incorrect_words",
    "select_missing_word",
  ],
};

const taskTypeInfo: Record<string, {
  label: string; description: string; time: string;
  tips: string; scoring: string; difficulty: string; weight: string;
}> = {
  read_aloud: {
    label: "Read Aloud",
    description: "A text appears on screen. Read it aloud as naturally and clearly as possible within the time limit.",
    time: "30–40 sec",
    tips: "Speak at a natural pace (100–160 WPM). Stress key words. Don't pause mid-sentence.",
    scoring: "Content (max 5) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Medium",
    weight: "High Impact",
  },
  repeat_sentence: {
    label: "Repeat Sentence",
    description: "You will hear a sentence. Repeat it exactly as you heard it, using the same words and intonation.",
    time: "15 sec",
    tips: "Listen to the whole sentence before repeating. Focus on exact wording, not paraphrasing.",
    scoring: "Content (max 3) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  describe_image: {
    label: "Describe Image",
    description: "An image (graph, chart, diagram, or picture) appears. Describe it in detail within the time limit.",
    time: "40 sec",
    tips: "Use a 3-part structure: overview → key data → conclusion. Mention the highest/lowest values.",
    scoring: "Content (max 3) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  retell_lecture: {
    label: "Re-tell Lecture",
    description: "You will hear a lecture. Re-tell the key points in your own words within the time limit.",
    time: "40 sec",
    tips: "Take notes during the lecture. Mention the topic, main points, and conclusion.",
    scoring: "Content (max 3) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  respond_to_situation: {
    label: "Respond to a Situation",
    description: "Read a situation and respond appropriately as if in a real-world conversation.",
    time: "30 sec",
    tips: "Use polite, natural language. Address the situation directly. Include relevant details.",
    scoring: "Content (max 3) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Medium",
    weight: "High Impact",
  },
  summarize_group_discussion: {
    label: "Summarize Group Discussion",
    description: "Listen to a group discussion and summarize the key points in your own words.",
    time: "40 sec",
    tips: "Identify each speaker's main point. Mention agreements and disagreements. Conclude with the overall outcome.",
    scoring: "Content (max 3) + Pronunciation (max 5) + Oral Fluency (max 5)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  answer_short_question: {
    label: "Answer Short Question",
    description: "You will hear a question. Respond with one or a few words — no full sentences needed.",
    time: "10 sec",
    tips: "Answer directly with the specific word or phrase. Avoid filler words.",
    scoring: "Vocabulary (1 mark per correct answer)",
    difficulty: "Easy",
    weight: "Low Impact",
  },
  summarize_written_text: {
    label: "Summarize Written Text",
    description: "Read a passage and write a one-sentence summary of 5–75 words capturing the main idea.",
    time: "10 min",
    tips: "Use a complex sentence with a main clause and subordinate clauses. Include the main idea and 2–3 key points.",
    scoring: "Content (max 2) + Form (max 1) + Grammar (max 2) + Vocabulary (max 2)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  write_essay: {
    label: "Write Essay",
    description: "Write a 200–300 word argumentative or discussion essay on the given topic.",
    time: "20 min",
    tips: "Structure: Introduction (topic + thesis) → Body 1 → Body 2 → Conclusion. Use discourse markers.",
    scoring: "Content (max 3) + Form (max 2) + Grammar (max 2) + Vocabulary (max 2) + Written Discourse (max 2) + Spelling (max 2)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  multiple_choice_single: {
    label: "Multiple Choice (Single)",
    description: "Read a passage and select the single best answer from the options provided.",
    time: "2 min",
    tips: "Read the question before the passage. Eliminate obviously wrong answers first.",
    scoring: "1 mark for correct answer, 0 for incorrect",
    difficulty: "Medium",
    weight: "Medium Impact",
  },
  multiple_choice_multiple: {
    label: "Multiple Choice (Multiple)",
    description: "Read a passage and select ALL correct answers. Negative marking applies.",
    time: "2.5 min",
    tips: "Each correct answer adds 1 mark; each incorrect answer deducts 1 mark. Only select answers you're confident about.",
    scoring: "+1 per correct, −1 per incorrect (minimum 0)",
    difficulty: "Hard",
    weight: "Medium Impact",
  },
  reorder_paragraphs: {
    label: "Re-order Paragraphs",
    description: "Arrange the text boxes in the correct logical order to form a coherent passage.",
    time: "2 min",
    tips: "Find the topic sentence (no pronoun references). Look for discourse markers and pronoun-antecedent links.",
    scoring: "1 mark per correctly placed adjacent pair",
    difficulty: "Hard",
    weight: "Medium Impact",
  },
  fill_blanks_reading: {
    label: "Fill in the Blanks (Reading)",
    description: "Drag words from the box to fill the blanks in the text. More words are given than needed.",
    time: "2 min",
    tips: "Read the full passage first. Consider both meaning and grammatical form (noun/verb/adjective).",
    scoring: "1 mark per correct blank",
    difficulty: "Medium",
    weight: "Medium Impact",
  },
  fill_blanks_rw: {
    label: "Fill in the Blanks (R&W)",
    description: "Select the correct word from a dropdown menu for each blank in the passage.",
    time: "2 min",
    tips: "Consider collocations and register. All options may be grammatically correct — choose by meaning.",
    scoring: "1 mark per correct blank",
    difficulty: "Medium",
    weight: "High Impact",
  },
  summarize_spoken_text: {
    label: "Summarize Spoken Text",
    description: "Listen to a 60–90 second lecture and write a 50–70 word summary.",
    time: "10 min",
    tips: "Take notes during the audio. Include the topic, main argument, and 2–3 supporting details.",
    scoring: "Content (max 2) + Form (max 1) + Grammar (max 2) + Vocabulary (max 2) + Spelling (max 2)",
    difficulty: "Hard",
    weight: "High Impact",
  },
  fill_blanks_listening: {
    label: "Fill in the Blanks (Listening)",
    description: "Listen to a recording and type the missing words in the transcript as you hear them.",
    time: "2 min",
    tips: "Follow the transcript while listening. Type exactly what you hear — spelling counts.",
    scoring: "1 mark per correctly spelled word",
    difficulty: "Medium",
    weight: "High Impact",
  },
  highlight_correct_summary: {
    label: "Highlight Correct Summary",
    description: "Listen to a recording and select the paragraph that best summarises it.",
    time: "1.5 min",
    tips: "Listen for the main idea. Eliminate summaries that are too specific, too general, or contain errors.",
    scoring: "1 mark for correct answer",
    difficulty: "Medium",
    weight: "Medium Impact",
  },
  select_missing_word: {
    label: "Select Missing Word",
    description: "Listen to a recording where the last word/phrase is replaced by a beep. Select the correct completion.",
    time: "1 min",
    tips: "Listen for the context and predict the word before the beep. Consider grammar and meaning.",
    scoring: "1 mark for correct answer",
    difficulty: "Easy",
    weight: "Low Impact",
  },
  highlight_incorrect_words: {
    label: "Highlight Incorrect Words",
    description: "A recording plays alongside a transcript. Click on words in the transcript that differ from the audio.",
    time: "2 min",
    tips: "Follow the transcript word by word. Click immediately when you hear a discrepancy.",
    scoring: "+1 per correct click, −1 per incorrect click (minimum 0)",
    difficulty: "Medium",
    weight: "High Impact",
  },
  write_from_dictation: {
    label: "Write from Dictation",
    description: "Listen to a short sentence and type it exactly as you hear it, including all words.",
    time: "30 sec",
    tips: "Listen to the full sentence first, then type. Check spelling carefully — every word counts.",
    scoring: "1 mark per correctly spelled word",
    difficulty: "Medium",
    weight: "High Impact",
  },
};

const difficultyColor: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

const weightColor: Record<string, string> = {
  "High Impact": "bg-teal-100 text-teal-700",
  "Medium Impact": "bg-blue-100 text-blue-700",
  "Low Impact": "bg-gray-100 text-gray-600",
};

export default function Practice() {
  const params = useParams<{ section?: string }>();
  const [activeSection, setActiveSection] = useState(params.section || "speaking");

  // Sync activeSection when URL param changes (e.g., navigating from Home "Practice Now")
  useEffect(() => {
    if (params.section && params.section !== activeSection) {
      setActiveSection(params.section);
      setExpandedTaskType(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.section]);
  const [selectedMode, setSelectedMode] = useState<"beginner" | "exam" | "diagnostic" | "revision">("exam");
  const [expandedTaskType, setExpandedTaskType] = useState<string | null>(null);

  const { data: questions, isLoading } = trpc.questions.list.useQuery({
    section: activeSection as any,
    limit: 100,
  });

  const createSession = trpc.sessions.create.useMutation();

  const startPractice = async (questionId: number, taskType: string) => {
    try {
      const session = await createSession.mutateAsync({
        sessionType: "section_practice",
        section: activeSection as any,
        mode: selectedMode,
        totalQuestions: 1,
      });
      window.location.href = `/session/${session.id}?questionId=${questionId}&taskType=${taskType}&mode=${selectedMode}`;
    } catch {
      toast.error("Failed to start practice session");
    }
  };

  const startRandomPractice = async (taskType: string) => {
    const taskQs = groupedByTaskType?.[taskType];
    if (!taskQs || taskQs.length === 0) return;
    const randomQ = taskQs[Math.floor(Math.random() * taskQs.length)];
    await startPractice(randomQ.id, taskType);
  };

  const groupedByTaskType = questions?.reduce((acc, q) => {
    if (!acc[q.taskType]) acc[q.taskType] = [];
    acc[q.taskType].push(q);
    return acc;
  }, {} as Record<string, typeof questions>);

  const activeSectionInfo = sections.find(s => s.id === activeSection)!;

  return (
    <PTELayout title="Practice">
      <div className="max-w-4xl space-y-5">

        {/* Section tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sections.map(({ id, label, icon: Icon, color, textColor, borderColor, bgLight, description }, i) => (
            <motion.button
              key={id}
              onClick={() => { setActiveSection(id); setExpandedTaskType(null); }}
              className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 transition-all text-left ${
                activeSection === id
                  ? `${borderColor} ${bgLight} shadow-sm`
                  : "border-transparent bg-card hover:bg-muted"
              }`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${activeSection === id ? textColor : "text-foreground"}`}>{label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Mode selector */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-foreground mr-1">Mode:</span>
            {([
              { id: "beginner", label: "Beginner", icon: "🎓", desc: "Guided with hints" },
              { id: "exam", label: "Exam", icon: "⏱", desc: "Strict timing" },
              { id: "diagnostic", label: "Diagnostic", icon: "🔍", desc: "Weakness detection" },
              { id: "revision", label: "Revision", icon: "🔄", desc: "SRS-powered" },
            ] as const).map(({ id, label, icon, desc }) => (
              <button
                key={id}
                onClick={() => setSelectedMode(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedMode === id
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-muted text-muted-foreground border-transparent hover:border-border"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {selectedMode === "beginner" && "Guided mode with templates and hints to help you get started."}
            {selectedMode === "exam" && "Strict timing and scoring to simulate real exam conditions."}
            {selectedMode === "diagnostic" && "Identifies your weak areas with detailed skill analysis."}
            {selectedMode === "revision" && "Focuses on spaced repetition of your weak questions."}
          </p>
        </div>

        {/* Task type accordion cards */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="h-20 bg-muted rounded-xl"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : groupedByTaskType && Object.keys(groupedByTaskType).length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              className="space-y-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {Object.entries(groupedByTaskType)
                .sort(([taskTypeA], [taskTypeB]) => {
                  const order = SECTION_TASK_ORDER[activeSection] || [];
                  const indexA = order.indexOf(taskTypeA);
                  const indexB = order.indexOf(taskTypeB);
                  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                })
                .map(([taskType, taskQuestions], idx) => {
                const info = taskTypeInfo[taskType] || {
                  label: taskType, description: "", time: "—",
                  tips: "", scoring: "", difficulty: "Medium", weight: "Medium Impact"
                };
                const isExpanded = expandedTaskType === taskType;
                const totalQ = taskQuestions.length;

                return (
                  <motion.div
                    key={taskType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Task type header — click to expand */}
                    <button
                      onClick={() => setExpandedTaskType(isExpanded ? null : taskType)}
                      className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Task type icon indicator */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          activeSectionInfo.color
                        } bg-opacity-15`}
                          style={{ background: `color-mix(in srgb, var(--color-teal-600) 12%, white)` }}
                        >
                          {activeSection === "speaking" ? <Mic className="w-4 h-4 text-teal-700" /> :
                           activeSection === "writing" ? <PenLine className="w-4 h-4 text-teal-700" /> :
                           activeSection === "reading" ? <Eye className="w-4 h-4 text-teal-700" /> :
                           <Headphones className="w-4 h-4 text-teal-700" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{info.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${weightColor[info.weight] || "bg-gray-100 text-gray-600"}`}>
                              {info.weight}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">{info.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {info.time}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          <BookOpen className="w-3 h-3" />
                          {totalQ} Q
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          {/* Task info bar */}
                          <div className="px-4 pb-3 border-t border-border bg-muted/30">
                            <div className="pt-3 grid sm:grid-cols-2 gap-3">
                              {/* Tips */}
                              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-blue-700 mb-0.5">Exam Tip</p>
                                  <p className="text-xs text-blue-700">{info.tips}</p>
                                </div>
                              </div>
                              {/* Scoring */}
                              <div className="flex items-start gap-2 bg-teal-50 border border-teal-100 rounded-lg p-3">
                                <BarChart2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-teal-700 mb-0.5">Scoring Criteria</p>
                                  <p className="text-xs text-teal-700">{info.scoring}</p>
                                </div>
                              </div>
                            </div>

                            {/* Quick start button */}
                            <div className="flex items-center justify-between mt-3 mb-2">
                              <p className="text-xs font-semibold text-foreground">
                                {totalQ} Practice Questions
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startRandomPractice(taskType)}
                                disabled={createSession.isPending}
                                className="text-xs gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50"
                              >
                                <Zap className="w-3 h-3" />
                                Random Question
                              </Button>
                            </div>

                            {/* Question list */}
                            <div className="space-y-1.5">
                              {taskQuestions.map((q, qIdx) => (
                                <motion.div
                                  key={q.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: qIdx * 0.04, duration: 0.2 }}
                                  className="flex items-center justify-between gap-3 p-3 bg-card rounded-lg border border-border hover:border-teal-200 hover:bg-teal-50/30 transition-all group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs text-muted-foreground w-5 shrink-0 font-mono">
                                      {String(qIdx + 1).padStart(2, "0")}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                      q.difficulty === "easy" ? "bg-green-500" :
                                      q.difficulty === "medium" ? "bg-yellow-500" : "bg-red-500"
                                    }`} />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate group-hover:text-teal-700 transition-colors">
                                        {q.title}
                                      </p>
                                      {q.content && (
                                        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                                          {typeof q.content === "string"
                                            ? q.content.replace(/_____/g, "___").substring(0, 90) + (q.content.length > 90 ? "…" : "")
                                            : ""}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs capitalize hidden sm:flex border ${difficultyColor[q.difficulty] || ""}`}
                                    >
                                      {q.difficulty}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      onClick={() => startPractice(q.id, q.taskType)}
                                      disabled={createSession.isPending}
                                      className="text-xs gap-1 bg-teal-600 hover:bg-teal-700 text-white h-7 px-3"
                                    >
                                      <Play className="w-3 h-3 fill-white" />
                                      Start
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="bg-card border border-border rounded-xl py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No questions available for this section yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon — more questions are being added.</p>
          </div>
        )}
      </div>
    </PTELayout>
  );
}
