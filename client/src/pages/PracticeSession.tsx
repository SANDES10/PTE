import PTELayout from "@/components/PTELayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Mic, MicOff, Square, Play, Clock, CheckCircle, AlertCircle,
  ChevronRight, Volume2, Info, Loader2, ArrowRight, RotateCcw, Brain
} from "lucide-react";
import AIFeedbackPanel from "@/components/AIFeedbackPanel";
import SpeakingTask, { SPEAKING_TIMINGS } from "@/components/SpeakingTask";


interface TaskResult {
  responseId: number;
  normalizedScore?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  pronunciationFeedback?: string;
  fluencyFeedback?: string;
  grammarErrors?: string[];
  vocabularyFeedback?: string;
  isCorrect?: boolean;
  transcription?: string;
  timeTaken?: number;
  // Enhanced AI scoring fields
  cefrLevel?: string;
  wordLevelFeedback?: string;
  modelAnswer?: string;
  strategyTips?: string[];
  traits?: Record<string, { score: number; maxScore: number; feedback: string }>;
  rawScore?: number;
  maxRawScore?: number;
  wordCount?: number;
  explanation?: string;
}

// ── Repeat Sentence TTS Auto-play ───────────────────────────────────────────
// Plays the sentence once automatically when the component mounts,
// then shows a "Replay" button. Mimics the real PTE exam behaviour.

function RepeatSentencePlayer({ sentence }: { sentence: string }) {
  const [status, setStatus] = useState<"playing" | "done" | "error">("playing");
  const [hasPlayed, setHasPlayed] = useState(false);

  const playTTS = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setStatus("error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = "en-GB";
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
    ) ?? voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { setStatus("done"); setHasPlayed(true); };
    utterance.onerror = () => { setStatus("error"); setHasPlayed(true); };
    window.speechSynthesis.speak(utterance);
    setStatus("playing");
  }, []);

  // Auto-play on mount — wait for voices to load first
  useEffect(() => {
    const startPlayback = () => playTTS(sentence);
    if (window.speechSynthesis.getVoices().length > 0) {
      // Voices already loaded — small delay to let the UI render first
      const t = setTimeout(startPlayback, 600);
      return () => clearTimeout(t);
    } else {
      // Voices not yet loaded — wait for the event
      window.speechSynthesis.addEventListener("voiceschanged", startPlayback, { once: true });
      return () => window.speechSynthesis.removeEventListener("voiceschanged", startPlayback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          status === "playing" ? "bg-teal-500 animate-pulse" : "bg-teal-100"
        }`}>
          <Volume2 className={`w-5 h-5 ${ status === "playing" ? "text-white" : "text-teal-600" }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-700">
            {status === "playing" ? "Playing sentence…" : status === "done" ? "Sentence played — now repeat it" : "Could not play audio"}
          </p>
          <p className="text-xs text-teal-600 mt-0.5">
            {status === "playing"
              ? "Listen carefully. The sentence will play once."
              : "Recording will begin automatically. Repeat the sentence exactly as you heard it."}
          </p>
        </div>
        {hasPlayed && (
          <button
            onClick={() => playTTS(sentence)}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-teal-600 border border-teal-300 rounded-lg px-3 py-1.5 hover:bg-teal-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay
          </button>
        )}
      </div>
      {status === "playing" && (
        <div className="mt-3 flex items-center gap-1.5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="w-1 bg-teal-400 rounded-full animate-bounce"
              style={{ height: `${6 + (i % 4) * 4}px`, animationDelay: `${i * 0.1}s` }} />
          ))}
          <span className="text-xs text-teal-500 ml-1 animate-pulse">Audio playing…</span>
        </div>
      )}
    </div>
  );
}

// Timer component
function CountdownTimer({ seconds, onExpire, urgent = false }: { seconds: number; onExpire: () => void; urgent?: boolean }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // Stable ref so the interval callback always calls the latest onExpire
  // without needing it as a dependency (avoids re-creating the interval).
  const onExpireRef = useRef(onExpire);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      // Defer out of the render phase to avoid "setState during render" warning
      const t = setTimeout(() => onExpireRef.current(), 0);
      return () => clearTimeout(t);
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          // Defer here too — the setRemaining updater runs inside React internals
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 30 && urgent;

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${isUrgent ? "text-red-500 animate-pulse" : "text-foreground"}`}>
      <Clock className="w-4 h-4" />
      {mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`}
    </div>
  );
}

// Audio recorder component
function AudioRecorder({ onRecordingComplete, preparationTime = 0 }: {
  onRecordingComplete: (audioBlob: Blob) => void;
  preparationTime?: number;
}) {
  const [phase, setPhase] = useState<"preparing" | "recording" | "done">(preparationTime > 0 ? "preparing" : "recording");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [prepTime, setPrepTime] = useState(preparationTime);

  useEffect(() => {
    if (phase === "preparing" && preparationTime > 0) {
      const timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("recording");
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    if (phase === "recording" && !isRecording) {
      startRecording();
    }
  }, [phase]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        setPhase("done");
        onRecordingComplete(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (phase === "preparing") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center">
          <span className="text-2xl font-bold text-yellow-600">{prepTime}</span>
        </div>
        <p className="text-sm text-muted-foreground">Preparation time — recording starts automatically</p>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-500 flex items-center justify-center recording-pulse">
          <Mic className="w-7 h-7 text-red-500" />
        </div>
        <div className="flex gap-1 items-end h-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="waveform-bar w-1.5 bg-red-400 rounded-full" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-sm font-medium text-red-600">Recording... Speak clearly</p>
        <Button variant="outline" size="sm" onClick={stopRecording} className="border-red-300 text-red-600">
          <Square className="w-3 h-3 mr-1.5 fill-current" />
          Stop Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="w-16 h-16 rounded-full bg-green-100 border-4 border-green-500 flex items-center justify-center">
        <CheckCircle className="w-7 h-7 text-green-500" />
      </div>
      <p className="text-sm text-green-600 font-medium">Recording complete — processing...</p>
    </div>
  );
}

// Trait score bar component
function TraitBar({ label, score, maxScore, feedback, color = "blue" }: {
  label: string; score: number; maxScore: number; feedback: string; color?: string;
}) {
  const pct = Math.round((score / maxScore) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500",
    orange: "bg-orange-500", teal: "bg-teal-500", red: "bg-red-500",
  };
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorMap[color] || colorMap.blue}`} style={{ width: `${pct}%` }} />
      </div>
      {feedback && <p className="text-xs text-muted-foreground leading-snug">{feedback}</p>}
    </div>
  );
}

// Score display component
function ScoreDisplay({ result, taskType }: { result: TaskResult; taskType: string }) {
  const isSpeaking = ["read_aloud", "repeat_sentence", "describe_image", "retell_lecture", "answer_short_question", "respond_to_situation", "summarize_group_discussion"].includes(taskType);
  const isObjective = ["multiple_choice_single", "multiple_choice_multiple", "reorder_paragraphs",
    "fill_blanks_reading", "fill_blanks_rw", "highlight_correct_summary", "select_missing_word",
    "highlight_incorrect_words", "write_from_dictation"].includes(taskType);
  const isWriting = ["write_essay", "summarize_written_text"].includes(taskType);
  const isListening = ["summarize_spoken_text", "write_from_dictation", "highlight_correct_summary", "fill_blanks_listening"].includes(taskType);

  // Trait color mapping
  const traitColors: Record<string, string> = {
    pronunciation: "blue", oralFluency: "purple", content: "green",
    form: "teal", grammar: "orange", vocabulary: "blue", development: "purple",
    linguisticRange: "teal", spelling: "red",
  };
  const traitLabels: Record<string, string> = {
    pronunciation: "Pronunciation", oralFluency: "Oral Fluency", content: "Content",
    form: "Form", grammar: "Grammar", vocabulary: "Vocabulary", development: "Development",
    linguisticRange: "Linguistic Range", spelling: "Spelling",
  };

  const hasTraits = result.traits && Object.keys(result.traits).length > 0;

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="text-center py-4">
        {isObjective && !result.normalizedScore ? (
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
            result.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {result.isCorrect ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {result.isCorrect ? "Correct!" : "Incorrect"}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="text-5xl font-extrabold text-foreground">
              {result.normalizedScore ?? "—"}
            </div>
            <div className="text-sm text-muted-foreground">PTE Score (10–90)</div>
            {result.cefrLevel && (
              <span className="mt-1 px-3 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                CEFR {result.cefrLevel}
              </span>
            )}
            {result.rawScore !== undefined && result.maxRawScore !== undefined && (
              <div className="text-xs text-muted-foreground mt-1">
                Raw: {result.rawScore}/{result.maxRawScore} points
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trait breakdown */}
      {hasTraits && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Score Breakdown</h4>
          {Object.entries(result.traits!).map(([key, trait]) => (
            <TraitBar
              key={key}
              label={traitLabels[key] || key}
              score={trait.score}
              maxScore={trait.maxScore}
              feedback={trait.feedback}
              color={traitColors[key] || "blue"}
            />
          ))}
        </div>
      )}

      {/* Feedback */}
      {result.feedback && (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-foreground leading-relaxed">{result.feedback}</p>
        </div>
      )}

      {/* Explanation for objective tasks */}
      {result.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">Why this answer?</p>
          <p className="text-xs text-blue-600 leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {/* Strengths & Improvements */}
      <div className="grid sm:grid-cols-2 gap-4">
        {result.strengths && result.strengths.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-xs text-foreground bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">{s}</li>
              ))}
            </ul>
          </div>
        )}
        {result.improvements && result.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Areas to Improve
            </h4>
            <ul className="space-y-1">
              {result.improvements.map((s, i) => (
                <li key={i} className="text-xs text-foreground bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5">{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Strategy tips */}
      {result.strategyTips && result.strategyTips.length > 0 && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Strategy Tips
          </p>
          <ul className="space-y-1">
            {result.strategyTips.map((t, i) => (
              <li key={i} className="text-xs text-teal-700">• {t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Model answer */}
      {result.modelAnswer && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-700 mb-2">Model Answer (C1 level)</p>
          <p className="text-xs text-purple-700 leading-relaxed italic">{result.modelAnswer}</p>
        </div>
      )}

      {/* Speaking-specific feedback */}
      {isSpeaking && !hasTraits && (result.pronunciationFeedback || result.fluencyFeedback) && (
        <div className="space-y-2">
          {result.pronunciationFeedback && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Pronunciation</p>
              <p className="text-xs text-blue-600">{result.pronunciationFeedback}</p>
            </div>
          )}
          {result.fluencyFeedback && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700 mb-1">Oral Fluency</p>
              <p className="text-xs text-purple-600">{result.fluencyFeedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Grammar errors */}
      {result.grammarErrors && result.grammarErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-red-700 mb-2">Grammar Issues</p>
          <ul className="space-y-1">
            {result.grammarErrors.map((e, i) => (
              <li key={i} className="text-xs text-red-600">• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary feedback */}
      {result.vocabularyFeedback && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-700 mb-1">Vocabulary</p>
          <p className="text-xs text-indigo-600">{result.vocabularyFeedback}</p>
        </div>
      )}
    </div>
  );
}

export default function PracticeSession() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = parseInt(params.sessionId);


  // Parse URL params
  const urlParams = new URLSearchParams(window.location.search);
  const questionId = parseInt(urlParams.get("questionId") || "0");
  const mode = (urlParams.get("mode") || "exam") as "beginner" | "exam" | "diagnostic" | "revision";

  const { data: question, isLoading: questionLoading } = trpc.questions.getById.useQuery(
    { id: questionId },
    { enabled: !!questionId }
  );

  const submitResponse = trpc.responses.submit.useMutation();
  const completeSession = trpc.sessions.complete.useMutation();
  const aiScoreSpeak = trpc.aiScoring.scoreSpeak.useMutation();
  const aiScoreWrite = trpc.aiScoring.scoreWrite.useMutation();
  const aiScoreRead = trpc.aiScoring.scoreRead.useMutation();
  const aiScoreListen = trpc.aiScoring.scoreListen.useMutation();
  const [isAIScoring, setIsAIScoring] = useState(false);

  const [textResponse, setTextResponse] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [startTime] = useState(Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [reorderItems, setReorderItems] = useState<Array<{ id: string; text: string }>>([])
  const [arrangedItems, setArrangedItems] = useState<Array<{ id: string; text: string }>>([])
  // Speaking-specific state
  const [speakingTranscription, setSpeakingTranscription] = useState<string | undefined>(undefined);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const recordingStartRef = useRef<number>(0);

  // Initialize reorder items
  useEffect(() => {
    if (question?.taskType === "reorder_paragraphs" && question.content) {
      try {
        const items = JSON.parse(question.content as string);
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        setReorderItems(shuffled);
      } catch {}
    }
  }, [question]);

  const isSpeakingTask = question && ["read_aloud", "repeat_sentence", "describe_image", "retell_lecture", "answer_short_question", "respond_to_situation", "summarize_group_discussion"].includes(question.taskType);
  const isWritingTask = question && ["summarize_written_text", "write_essay"].includes(question.taskType);
  const isObjectiveTask = question && !isSpeakingTask && !isWritingTask;

  const handleSubmit = async () => {
    if (!question) return;
    setIsSubmitting(true);

    try {
      let audioUrl: string | undefined;

      // Upload audio if speaking task
      if (isSpeakingTask && audioBlob) {
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const response = await fetch("/api/upload-audio", {
            method: "POST",
            headers: { "Content-Type": "audio/webm" },
            body: uint8Array,
          });
          if (response.ok) {
            const data = await response.json();
            audioUrl = data.url;
          }
        } catch (e) {
          console.error("Audio upload failed:", e);
        }
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const response = await submitResponse.mutateAsync({
        sessionId,
        questionId: question.id,
        responseText: textResponse || undefined,
        audioUrl,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
        timeTaken,
      });

      const taskResult = response as TaskResult;
      setResult(taskResult);
      // Capture Whisper transcription for word-level analysis
      if (taskResult.transcription) {
        setSpeakingTranscription(taskResult.transcription);
      }
      // Complete session
      await completeSession.mutateAsync({ id: sessionId });
      // Trigger section-specific AI scoring in the background
      if (taskResult.responseId && question) {
        setIsAIScoring(true);
        try {
          let aiResult: TaskResult | null = null;
          if (isSpeakingTask) {
            aiResult = await aiScoreSpeak.mutateAsync({
              responseId: taskResult.responseId,
              audioUrl: audioUrl,
              transcription: taskResult.transcription,
            }) as unknown as TaskResult;
          } else if (isWritingTask) {
            aiResult = await aiScoreWrite.mutateAsync({
              responseId: taskResult.responseId,
              responseText: textResponse || undefined,
            }) as unknown as TaskResult;
          } else if (question.section === "reading") {
            aiResult = await aiScoreRead.mutateAsync({
              responseId: taskResult.responseId,
              selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
              orderedItems: arrangedItems.length > 0 ? arrangedItems.map(i => i.id) : undefined,
            }) as unknown as TaskResult;
          } else if (question.section === "listening") {
            aiResult = await aiScoreListen.mutateAsync({
              responseId: taskResult.responseId,
              responseText: textResponse || undefined,
              selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
            }) as unknown as TaskResult;
          }
          if (aiResult) {
            // Merge AI result into the existing task result
            setResult(prev => prev ? { ...prev, ...aiResult } : aiResult);
          }
        } catch (aiErr) {
          console.error("AI scoring failed (non-critical):", aiErr);
        } finally {
          setIsAIScoring(false);
        }
      }
    } catch (err) {
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setTimedOut(true);
  }, []);

  const handleOptionToggle = (optionId: string, isSingle: boolean) => {
    if (isSingle) {
      setSelectedOptions([optionId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optionId) ? prev.filter(o => o !== optionId) : [...prev, optionId]
      );
    }
  };

  const moveToArranged = (item: { id: string; text: string }) => {
    setReorderItems(prev => prev.filter(i => i.id !== item.id));
    setArrangedItems(prev => [...prev, item]);
    setSelectedOptions(prev => [...prev, item.id]);
  };

  const moveBack = (item: { id: string; text: string }) => {
    setArrangedItems(prev => prev.filter(i => i.id !== item.id));
    setReorderItems(prev => [...prev, item]);
    setSelectedOptions(prev => prev.filter(id => id !== item.id));
  };

  if (questionLoading) {
    return (
      <PTELayout title="Practice Session">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PTELayout>
    );
  }

  if (!question) {
    return (
      <PTELayout title="Practice Session">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Question not found.</p>
            <Button asChild className="mt-4">
              <a href="/practice">Back to Practice</a>
            </Button>
          </CardContent>
        </Card>
      </PTELayout>
    );
  }

  const options = question.options ? (typeof question.options === "string" ? JSON.parse(question.options) : question.options) as Array<{ id: string; text: string; correct: boolean }> : [];

  return (
    <PTELayout title={question.title}>
      <div className="max-w-3xl space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize">{question.section}</Badge>
            <Badge variant="secondary" className="capitalize">{question.taskType.replace(/_/g, " ")}</Badge>
            <Badge variant="outline" className={`capitalize ${
              question.difficulty === "easy" ? "border-green-300 text-green-700" :
              question.difficulty === "medium" ? "border-yellow-300 text-yellow-700" : "border-red-300 text-red-700"
            }`}>{question.difficulty}</Badge>
          </div>
          {!result && question.timeLimit && mode === "exam" && (
            <CountdownTimer
              seconds={question.timeLimit}
              onExpire={handleTimeUp}
              urgent
            />
          )}
        </div>

        {/* Mode hint */}
        {mode === "beginner" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Beginner Mode:</strong> Take your time. There's no strict time limit. Focus on understanding the task format.
            </p>
          </div>
        )}

        {/* Question card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">{question.prompt}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content display — skip describe_image (handled inside SpeakingTask) and repeat_sentence (audio only) */}
             {question.content && !["reorder_paragraphs", "describe_image", "repeat_sentence", "respond_to_situation", "summarize_group_discussion"].includes(question.taskType) && (
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed">{question.content as string}</p>
              </div>
            )}

            {/* Speaking task — enhanced with prep timer, live transcript, and colour highlighting */}
            {isSpeakingTask && (
              <div className="space-y-3">
                {/* Repeat Sentence TTS auto-play */}
                {question.taskType === "repeat_sentence" && !result && (
                  <RepeatSentencePlayer sentence={question.content as string} />
                )}

                {/* Task timing info banner */}
                {!result && (() => {
                  const t = SPEAKING_TIMINGS[question.taskType];
                  return t ? (
                    <div className="flex gap-3 text-xs">
                      {t.prep > 0 && (
                        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-teal-700 font-medium">Prep: {t.prep}s</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                        <Mic className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-700 font-medium">Record: {t.record}s</span>
                      </div>
                    </div>
                  ) : null;
                })()}

                <SpeakingTask
                  taskType={question.taskType}
                  originalText={question.content as string | undefined}
                  imageUrl={question.imageUrl || undefined}
                  onRecordingComplete={(blob) => {
                    setAudioBlob(blob);
                    setRecordingDuration((Date.now() - recordingStartRef.current) / 1000);
                  }}
                  transcription={speakingTranscription}
                  isSubmitted={!!result}
                  recordingDuration={recordingDuration}
                />
              </div>
            )}

            {/* Writing task */}
            {isWritingTask && !result && (
              <div className="space-y-3">
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder={question.taskType === "summarize_written_text"
                    ? "Write your one-sentence summary here (5–75 words)..."
                    : "Write your essay here (200–300 words)..."}
                  className="min-h-[200px] text-sm resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Word count: {textResponse.trim().split(/\s+/).filter(Boolean).length}</span>
                  {question.wordLimit && <span>Target: {question.taskType === "summarize_written_text" ? "5–75" : "200–300"} words</span>}
                </div>
                {mode === "beginner" && question.modelAnswer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">Model Answer (Beginner Mode)</p>
                    <p className="text-xs text-green-600">{question.modelAnswer as string}</p>
                  </div>
                )}
              </div>
            )}

            {/* MCQ tasks */}
            {(question.taskType === "multiple_choice_single" || question.taskType === "multiple_choice_multiple") && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionToggle(opt.id, question.taskType === "multiple_choice_single")}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium mr-2">{opt.id.toUpperCase()}.</span>
                    {opt.text}
                  </button>
                ))}
                {question.taskType === "multiple_choice_multiple" && (
                  <p className="text-xs text-muted-foreground">Select all correct answers.</p>
                )}
              </div>
            )}

            {/* Reorder paragraphs */}
            {question.taskType === "reorder_paragraphs" && !result && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Available (click to add)</p>
                  <div className="space-y-2 min-h-[100px] border border-dashed border-border rounded-xl p-2">
                    {reorderItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => moveToArranged(item)}
                        className="w-full text-left p-2.5 bg-muted rounded-lg text-xs hover:bg-muted/80 transition-colors"
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Your Order (click to remove)</p>
                  <div className="space-y-2 min-h-[100px] border border-dashed border-primary/30 rounded-xl p-2">
                    {arrangedItems.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => moveBack(item)}
                        className="w-full text-left p-2.5 bg-primary/10 border border-primary/20 rounded-lg text-xs hover:bg-primary/20 transition-colors"
                      >
                        <span className="font-bold text-primary mr-2">{idx + 1}.</span>
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text input tasks (fill blanks, write from dictation) */}
            {["fill_blanks_listening", "write_from_dictation", "fill_blanks_reading"].includes(question.taskType) && !result && (
              <Textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder={question.taskType === "write_from_dictation"
                  ? "Type the sentence exactly as you heard it..."
                  : "Type your answers separated by commas..."}
                className="min-h-[80px] text-sm"
              />
            )}

            {/* Highlight correct summary */}
            {question.taskType === "highlight_correct_summary" && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptions([opt.id])}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Select missing word */}
            {question.taskType === "select_missing_word" && !result && (
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOptions([opt.id])}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      selectedOptions.includes(opt.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium mr-2">{opt.id.toUpperCase()}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {/* Highlight incorrect words — click words to select them */}
            {question.taskType === "highlight_incorrect_words" && !result && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click on the words that are incorrect or out of place:</p>
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex flex-wrap gap-2">
                    {(question.content as string)?.split(/\s+/).map((word, idx) => {
                      const cleanWord = word.replace(/[^\w]/g, '');
                      const isSelected = selectedOptions.includes(cleanWord);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const wordToToggle = cleanWord;
                            if (selectedOptions.includes(wordToToggle)) {
                              setSelectedOptions(selectedOptions.filter(w => w !== wordToToggle));
                            } else {
                              setSelectedOptions([...selectedOptions, wordToToggle]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-red-500 text-white border-2 border-red-600"
                              : "bg-white text-foreground border-2 border-border hover:border-primary cursor-pointer"
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedOptions.length > 0 ? selectedOptions.join(", ") : "None"}
                </div>
              </div>
            )}

            {/* Fill in the blanks (Reading & Writing) — dropdown selects for each blank */}
            {question.taskType === "fill_blanks_rw" && !result && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Select the correct word for each blank:</p>
                <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3">
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground min-w-fit">Blank {idx + 1}:</span>
                      <select
                        value={selectedOptions[idx] || ""}
                        onChange={(e) => {
                          const newSelected = [...selectedOptions];
                          newSelected[idx] = e.target.value;
                          setSelectedOptions(newSelected);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
                      >
                        <option value="">-- Select an option --</option>
                        {opt.text.split(",").map((choice, cidx) => (
                          <option key={cidx} value={choice.trim()}>
                            {choice.trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summarize spoken text — listening task requiring written response */}
            {question.taskType === "summarize_spoken_text" && !result && (
              <div className="space-y-3">
                <Textarea
                  value={textResponse}
                  onChange={(e) => setTextResponse(e.target.value)}
                  placeholder="Listen to the audio and write a summary (50–70 words)..."
                  className="min-h-[120px] text-sm resize-none"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Word count: {textResponse.trim().split(/\s+/).filter(Boolean).length}</span>
                  <span>Target: 50–70 words</span>
                </div>
              </div>
            )}

            {/* Result display */}
            {result && <ScoreDisplay result={result} taskType={question.taskType} />}
            {/* AI scoring loading indicator */}
            {isAIScoring && (
              <div className="flex items-center gap-2 mt-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                <span className="text-xs text-primary font-medium">Analysing with section-specific AI engine…</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Feedback Panel - shown after submission */}
        {result && result.responseId && (
          <AIFeedbackPanel
            responseId={result.responseId}
            taskType={question.taskType}
            score={result.normalizedScore || 0}
            maxScore={90}
          />
        )}

        {/* Action buttons */}
        {!result ? (
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/practice">Cancel</a>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (isSpeakingTask && !audioBlob) || (isWritingTask && !textResponse.trim())}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scoring with AI...
                </>
              ) : (
                <>
                  Submit Answer
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <Button variant="outline" asChild>
              <a href="/practice">
                <RotateCcw className="w-4 h-4 mr-2" />
                Practice More
              </a>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground">
              <a href={`/score-report/${sessionId}`}>
                View Full Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </PTELayout>
  );
}
