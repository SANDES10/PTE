/**
 * SpeakingTask — Enhanced PTE Academic speaking task component
 *
 * Features:
 * - Preparation countdown with animated circular timer + SKIP button
 * - Real-time voice-reactive waveform using Web Audio API AnalyserNode
 *   (bars animate with actual microphone amplitude, not random CSS)
 * - Model audio playback via browser speechSynthesis (TTS) with speed control
 * - Visible images for Describe Image tasks
 * - Recording phase with auto-stop timer
 * - Real-time Web Speech API live transcript
 * - Post-submission word-level colour highlighting (LCS alignment)
 * - Fluency metrics: WPM, pauses, accuracy, omissions
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Mic, Square, Volume2, CheckCircle,
  Clock, Zap, Info, Activity, SkipForward,
  Play, Pause, StopCircle, ImageIcon, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Task timing config (seconds) ────────────────────────────────────────────

export const SPEAKING_TIMINGS: Record<string, { prep: number; record: number; label: string }> = {
  read_aloud:                  { prep: 40, record: 40, label: "Read Aloud" },
  repeat_sentence:             { prep: 0,  record: 15, label: "Repeat Sentence" },
  describe_image:              { prep: 25, record: 40, label: "Describe Image" },
  retell_lecture:              { prep: 10, record: 40, label: "Re-tell Lecture" },
  answer_short_question:       { prep: 3,  record: 10, label: "Answer Short Question" },
  summarize_group_discussion:  { prep: 10, record: 90, label: "Summarize Group Discussion" },
  respond_to_situation:        { prep: 10, record: 40, label: "Respond to a Situation" },
};

// ─── Word alignment types ─────────────────────────────────────────────────────

type WordStatus = "correct" | "hesitation" | "mispronounced" | "extra" | "missing";

interface AlignedWord {
  word: string;
  status: WordStatus;
  spokenWord?: string;
}

const STATUS_STYLES: Record<WordStatus, { bg: string; text: string; border: string; tooltip: string }> = {
  correct:      { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300",  tooltip: "Correctly pronounced" },
  hesitation:   { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", tooltip: "Hesitation / repeated" },
  mispronounced:{ bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300",    tooltip: "Mispronounced / unclear" },
  extra:        { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300",   tooltip: "Extra word (not in original)" },
  missing:      { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300",   tooltip: "Missing / not spoken" },
};

// ─── Circular countdown timer ─────────────────────────────────────────────────

function CircularTimer({ total, remaining, phase }: { total: number; remaining: number; phase: "prep" | "record" }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const dashOffset = circumference * (1 - progress);
  const isUrgent = remaining <= 10;
  const color = phase === "prep"
    ? (isUrgent ? "#f59e0b" : "#0d9488")
    : (isUrgent ? "#ef4444" : "#ef4444");

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="64" cy="64" r={radius}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className={`text-3xl font-black tabular-nums ${isUrgent ? "text-red-500 animate-pulse" : phase === "prep" ? "text-teal-600" : "text-red-500"}`}>
          {remaining}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-0.5">
          {phase === "prep" ? "seconds" : "sec left"}
        </span>
      </div>
    </div>
  );
}

// ─── Real-time Web Audio waveform ─────────────────────────────────────────────
// Uses AnalyserNode to read actual microphone amplitude data

const BAR_COUNT = 32;

function LiveWaveform({
  analyserRef,
  isActive,
}: {
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isActive: boolean;
}) {
  const [bars, setBars] = useState<number[]>(new Array(BAR_COUNT).fill(2));
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      setBars(new Array(BAR_COUNT).fill(2));
      return;
    }

    const dataArray = new Uint8Array(BAR_COUNT * 2);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      if (!analyser) return;
      analyser.getByteFrequencyData(dataArray);
      // Sample every other bin for visual variety
      const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
        const val = dataArray[i * 2] ?? 0;
        return Math.max(2, Math.round((val / 255) * 48));
      });
      setBars(newBars);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, analyserRef]);

  return (
    <div className="flex items-center justify-center gap-0.5 h-14 px-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-75 ${isActive ? "bg-red-400" : "bg-gray-200"}`}
          style={{
            width: "5px",
            height: `${h}px`,
            opacity: isActive ? 0.7 + (h / 48) * 0.3 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ─── Model TTS audio player ───────────────────────────────────────────────────

function ModelAudioPlayer({ text, taskType }: { text: string; taskType: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(0.9);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const play = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in your browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = "en-GB";
    // Prefer a natural-sounding English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium"))
    ) ?? voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, rate]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  // Stop on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  const rateLabels: Record<number, string> = { 0.7: "Slow", 0.9: "Normal", 1.1: "Fast" };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-bold text-indigo-700">Hear Model Pronunciation</span>
        <Badge variant="outline" className="text-xs text-indigo-500 border-indigo-200 ml-auto">AI Voice</Badge>
      </div>

      <p className="text-xs text-indigo-600 mb-3 leading-relaxed">
        {taskType === "read_aloud" || taskType === "repeat_sentence"
          ? "Listen to how this text should be pronounced, then try to match the pace and intonation."
          : taskType === "describe_image"
          ? "Listen to a model description of this image to understand the expected structure."
          : taskType === "retell_lecture"
          ? "Listen to a model re-tell to understand the expected structure and vocabulary."
          : "Listen to the expected answer to check your response."}
      </p>

      <div className="flex items-center gap-3">
        {/* Play / Stop */}
        {!isPlaying ? (
          <Button size="sm" onClick={play} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current" />
            Play Model
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={stop} className="border-indigo-300 text-indigo-600 gap-1.5">
            <StopCircle className="w-3.5 h-3.5" />
            Stop
          </Button>
        )}

        {/* Speed selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-indigo-500">Speed:</span>
          {[0.7, 0.9, 1.1].map(r => (
            <button
              key={r}
              onClick={() => { setRate(r); if (isPlaying) { stop(); setTimeout(play, 100); } }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                rate === r
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-indigo-200 text-indigo-500 hover:bg-indigo-100"
              }`}
            >
              {rateLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {isPlaying && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span className="text-xs text-indigo-500 animate-pulse">Playing model audio…</span>
        </div>
      )}
    </div>
  );
}

// ─── Image display for Describe Image ────────────────────────────────────────

function TaskImage({ imageUrl, taskType }: { imageUrl?: string; taskType: string }) {
  const [expanded, setExpanded] = useState(true);
  const [imgError, setImgError] = useState(false);
  
  // Reset error when imageUrl changes
  useEffect(() => {
    if (imageUrl && imgError) {
      setImgError(false);
    }
  }, [imageUrl]);

  if (taskType !== "describe_image" && taskType !== "retell_lecture") return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">
            {taskType === "describe_image" ? "Image to Describe" : "Lecture Reference"}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="p-4">
          {imageUrl && !imgError ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Task image"
                className="w-full max-h-80 object-contain rounded-xl border border-gray-100 bg-gray-50"
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
              />
              <div className="mt-2 text-xs text-gray-400 text-center">
                Study this image carefully during preparation time
              </div>
            </div>
          ) : (
            // Placeholder when no image is available
            <div className="flex flex-col items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
              <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-400">
                {taskType === "describe_image" ? "Bar Chart / Graph / Process Diagram" : "Lecture Visual Aid"}
              </p>
              <p className="text-xs text-gray-300 mt-1">Image will appear here in the full exam</p>
              {/* Simulated chart placeholder */}
              <div className="mt-3 flex items-end gap-1.5">
                {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
                  <div key={i} className="w-5 bg-teal-200 rounded-t" style={{ height: `${h * 0.4}px` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Word-level highlight display ─────────────────────────────────────────────

function WordHighlight({ words }: { words: AlignedWord[] }) {
  const [tooltip, setTooltip] = useState<{ word: string; status: WordStatus; x: number; y: number } | null>(null);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 leading-relaxed">
        {words.map((w, i) => {
          const style = STATUS_STYLES[w.status];
          return (
            <span
              key={i}
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-sm font-medium cursor-help transition-transform hover:scale-105 ${style.bg} ${style.text} ${style.border}`}
              onMouseEnter={(e) => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltip({ word: w.word, status: w.status, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {w.status === "missing" ? (
                <span className="line-through opacity-60">{w.word}</span>
              ) : w.word}
              {w.status === "mispronounced" && w.spokenWord && (
                <span className="ml-1 text-[10px] opacity-70">→ "{w.spokenWord}"</span>
              )}
            </span>
          );
        })}
      </div>
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y - 36 }}
        >
          {STATUS_STYLES[tooltip.status].tooltip}
        </div>
      )}
    </div>
  );
}

// ─── Colour legend ────────────────────────────────────────────────────────────

function ColourLegend() {
  const items: Array<{ status: WordStatus; label: string }> = [
    { status: "correct",       label: "Correct" },
    { status: "hesitation",    label: "Hesitation" },
    { status: "mispronounced", label: "Mispronounced" },
    { status: "extra",         label: "Extra word" },
    { status: "missing",       label: "Missing" },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {items.map(({ status, label }) => {
        const s = STATUS_STYLES[status];
        return (
          <div key={status} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${s.bg} ${s.text} ${s.border}`}>
            <div className={`w-2 h-2 rounded-full ${s.bg.replace("100", "400")}`} />
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Fluency metrics ──────────────────────────────────────────────────────────

function FluencyMetrics({ wpm, pauseCount, correctPct, missingPct }: {
  wpm: number; pauseCount: number; correctPct: number; missingPct: number;
}) {
  const wpmColor = wpm >= 100 && wpm <= 160 ? "text-green-600" : wpm < 80 || wpm > 200 ? "text-red-600" : "text-yellow-600";
  const wpmLabel = wpm >= 100 && wpm <= 160 ? "Good pace" : wpm < 80 ? "Too slow" : wpm > 200 ? "Too fast" : "Slightly off";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      {[
        { val: wpm, label: "WPM", sub: wpmLabel, color: wpmColor },
        { val: pauseCount, label: "Pauses", sub: pauseCount <= 2 ? "Fluent" : pauseCount <= 5 ? "Some pauses" : "Too many", color: pauseCount <= 2 ? "text-green-600" : pauseCount <= 5 ? "text-yellow-600" : "text-red-600" },
        { val: `${correctPct}%`, label: "Accuracy", sub: correctPct >= 80 ? "Excellent" : correctPct >= 60 ? "Good" : "Needs work", color: correctPct >= 80 ? "text-green-600" : correctPct >= 60 ? "text-yellow-600" : "text-red-600" },
        { val: `${missingPct}%`, label: "Omissions", sub: missingPct <= 10 ? "Complete" : missingPct <= 25 ? "Some skipped" : "Many skipped", color: missingPct <= 10 ? "text-green-600" : missingPct <= 25 ? "text-yellow-600" : "text-red-600" },
      ].map(({ val, label, sub, color }) => (
        <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
          <div className={`text-2xl font-black ${color}`}>{val}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          <div className={`text-[10px] font-medium mt-0.5 ${color}`}>{sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Word alignment algorithm ─────────────────────────────────────────────────

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/g, "");
}

function alignWords(originalText: string, spokenText: string): AlignedWord[] {
  const origWords = originalText.trim().split(/\s+/).filter(Boolean);
  const spokenWords = spokenText.trim().split(/\s+/).filter(Boolean);

  if (!spokenWords.length) return origWords.map(w => ({ word: w, status: "missing" as WordStatus }));

  const origNorm = origWords.map(normalizeWord);
  const spokenNorm = spokenWords.map(normalizeWord);
  const m = origNorm.length;
  const n = spokenNorm.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = origNorm[i - 1] === spokenNorm[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const origResult: Array<{ origIdx: number; spokenIdx: number | null }> = [];
  const extraWords: AlignedWord[] = [];
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origNorm[i - 1] === spokenNorm[j - 1]) {
      origResult.unshift({ origIdx: i - 1, spokenIdx: j - 1 });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      extraWords.push({ word: spokenWords[j - 1]!, status: "extra" });
      j--;
    } else {
      origResult.unshift({ origIdx: i - 1, spokenIdx: null });
      i--;
    }
  }

  const aligned: AlignedWord[] = [];
  for (const { origIdx, spokenIdx } of origResult) {
    const origWord = origWords[origIdx]!;
    if (spokenIdx === null) {
      aligned.push({ word: origWord, status: "missing" });
    } else {
      const spokenWord = spokenWords[spokenIdx]!;
      const oNorm = origNorm[origIdx]!;
      const sNorm = spokenNorm[spokenIdx]!;
      if (oNorm === sNorm) {
        const prevSpoken = spokenIdx > 0 ? spokenNorm[spokenIdx - 1] : null;
        aligned.push({ word: origWord, status: prevSpoken === sNorm ? "hesitation" : "correct", spokenWord });
      } else {
        aligned.push({ word: origWord, status: "mispronounced", spokenWord });
      }
    }
  }

  return [...aligned, ...extraWords];
}

function computeFluencyMetrics(aligned: AlignedWord[], durationSeconds: number) {
  const total = aligned.filter(w => w.status !== "extra").length;
  const correct = aligned.filter(w => w.status === "correct").length;
  const missing = aligned.filter(w => w.status === "missing").length;
  const hesitations = aligned.filter(w => w.status === "hesitation").length;
  const spokenWords = aligned.filter(w => w.status !== "missing").length;
  return {
    wpm: durationSeconds > 0 ? Math.round((spokenWords / durationSeconds) * 60) : 0,
    pauseCount: hesitations,
    correctPct: total > 0 ? Math.round((correct / total) * 100) : 0,
    missingPct: total > 0 ? Math.round((missing / total) * 100) : 0,
  };
}

// ─── Main SpeakingTask component ──────────────────────────────────────────────

interface SpeakingTaskProps {
  taskType: string;
  originalText?: string;
  imageUrl?: string;           // for describe_image tasks
  onRecordingComplete: (blob: Blob) => void;
  transcription?: string;
  isSubmitted?: boolean;
  recordingDuration?: number;
}

type Phase = "prep" | "recording" | "done";

export default function SpeakingTask({
  taskType,
  originalText,
  imageUrl,
  onRecordingComplete,
  transcription,
  isSubmitted,
  recordingDuration,
}: SpeakingTaskProps) {
  const timing = SPEAKING_TIMINGS[taskType] ?? { prep: 0, record: 40, label: "Speaking" };
  
  // Debug: log imageUrl
  useEffect(() => {
    console.log('[SpeakingTask] imageUrl:', imageUrl, 'taskType:', taskType);
  }, [imageUrl, taskType]);

  const [phase, setPhase] = useState<Phase>(timing.prep > 0 ? "prep" : "recording");
  const [prepRemaining, setPrepRemaining] = useState(timing.prep);
  const [recordRemaining, setRecordRemaining] = useState(timing.record);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [recordStart, setRecordStart] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // ── Skip preparation time ──────────────────────────────────────────────────

  const skipPrep = useCallback(() => {
    clearInterval(prepTimerRef.current);
    setPrepRemaining(0);
    setPhase("recording");
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // ── Web Audio API analyser for real-time waveform ──
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        audioCtx.close();
        analyserRef.current = null;
        const dur = (Date.now() - recordStart) / 1000;
        setActualDuration(dur);
        setPhase("done");
        setAudioBlob(blob);
        // Create object URL for audio playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
        clearInterval(recordTimerRef.current);
      };

      mediaRecorder.start(100);
      const now = Date.now();
      setIsRecording(true);
      setRecordStart(now);
      
      // Play beep sound when recording starts
      try {
        const beepCtx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = beepCtx.createOscillator();
        const gain = beepCtx.createGain();
        osc.connect(gain);
        gain.connect(beepCtx.destination);
        osc.frequency.value = 1000; // 1kHz beep
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, beepCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, beepCtx.currentTime + 0.1);
        osc.start(beepCtx.currentTime);
        osc.stop(beepCtx.currentTime + 0.1);
        beepCtx.close();
      } catch (e) {
        console.warn('Could not play beep sound:', e);
      }

      // Record countdown
      recordTimerRef.current = setInterval(() => {
        setRecordRemaining(prev => {
          if (prev <= 1) {
            clearInterval(recordTimerRef.current);
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsRecording(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Web Speech API live transcript
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const SpeechRecognitionAPI = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition: any = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result?.[0]) {
              if (result.isFinal) final += result[0].transcript + " ";
              else interim += result[0].transcript;
            }
          }
          setLiveTranscript(prev => (prev + final + interim).trim());
        };
        recognition.onerror = () => {};
        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch {
      toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
    }
  }, [onRecordingComplete, recordStart, audioUrl]);

  // ── Stop recording manually ────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    speechRecognitionRef.current?.stop();
    clearInterval(recordTimerRef.current);
  }, []);

  // ── Cleanup audio URL on unmount ────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // ── Prep countdown ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "prep") return;
    if (timing.prep === 0) { setPhase("recording"); return; }

    prepTimerRef.current = setInterval(() => {
      setPrepRemaining(prev => {
        if (prev <= 1) { clearInterval(prepTimerRef.current); setPhase("recording"); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(prepTimerRef.current);
  }, [phase, timing.prep]);

  // ── Auto-start recording ───────────────────────────────────────────────────

  useEffect(() => {
    if (phase === "recording" && !isRecording) startRecording();
  }, [phase, isRecording, startRecording]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearInterval(prepTimerRef.current);
      clearInterval(recordTimerRef.current);
      speechRecognitionRef.current?.stop();
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      audioContextRef.current?.close();
    };
  }, []);

  // ── Post-submission analysis ───────────────────────────────────────────────

  const finalTranscript = transcription || liveTranscript;
  const aligned = (isSubmitted && originalText && finalTranscript)
    ? alignWords(originalText, finalTranscript)
    : null;
  const fluency = (aligned && (recordingDuration ?? actualDuration) > 0)
    ? computeFluencyMetrics(aligned, recordingDuration ?? actualDuration)
    : null;

  // ── Model text for TTS ─────────────────────────────────────────────────────
  // Use the original text for read_aloud / repeat_sentence, or a generated description for others

  const modelText = originalText || "";

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Image / Resource panel (always shown for describe_image) ── */}
      {(taskType === "describe_image" || taskType === "retell_lecture") && (
        <TaskImage imageUrl={imageUrl} taskType={taskType} />
      )}

      {/* ── Persistent audio playback (always available after recording) ── */}
      {audioUrl && phase !== "recording" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
          <audio 
            ref={audioRef}
            controls 
            src={audioUrl} 
            className="flex-1 h-8 rounded" 
            controlsList="nodownload"
          />
          <span className="text-xs text-blue-600 font-medium whitespace-nowrap">{actualDuration.toFixed(1)}s</span>
        </div>
      )}

      {/* ── Model audio player (shown before submission) ── */}
      {!isSubmitted && modelText && (
        <ModelAudioPlayer text={modelText} taskType={taskType} />
      )}

      {/* ── PREP PHASE ── */}
      {phase === "prep" && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">Preparation Time</span>
            </div>

            <CircularTimer total={timing.prep} remaining={prepRemaining} phase="prep" />

            {/* Skip prep button */}
            <Button
              variant="outline"
              size="sm"
              onClick={skipPrep}
              className="border-teal-300 text-teal-700 hover:bg-teal-100 gap-1.5 font-semibold"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip Preparation
            </Button>

            <div className="text-center max-w-sm">
              {taskType === "read_aloud" && <p className="text-sm text-teal-700">Read the text carefully. Recording begins automatically when the timer reaches zero.</p>}
              {taskType === "describe_image" && <p className="text-sm text-teal-700">Study the image above. Plan what you will say about the key features, trends, or comparisons.</p>}
              {taskType === "retell_lecture" && <p className="text-sm text-teal-700">Review your notes. Organise the main points you heard in the lecture.</p>}
              {taskType === "answer_short_question" && <p className="text-sm text-teal-700">Think of your answer. Speak clearly and concisely when recording starts.</p>}
              {taskType === "respond_to_situation" && <p className="text-sm text-teal-700">Read the situation carefully. Plan your response — address the key points and speak naturally as you would in real life.</p>}
              {taskType === "summarize_group_discussion" && <p className="text-sm text-teal-700">Review the discussion. Plan to summarise each speaker's main point and the overall conclusion.</p>}
            </div>

            <div className="bg-white/70 rounded-xl p-3 w-full max-w-sm border border-teal-100">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <div className="text-xs text-teal-700 space-y-1">
                  {taskType === "read_aloud" && (<><p>• Scan the entire text before speaking</p><p>• Note punctuation for natural pauses</p><p>• Aim for 100–160 words per minute</p></>)}
                  {taskType === "describe_image" && (<><p>• Identify the main topic of the image</p><p>• Note 2–3 key features or trends</p><p>• Plan an opening, body, and conclusion</p></>)}
                  {taskType === "retell_lecture" && (<><p>• Start with the main topic</p><p>• Include 2–3 supporting details</p><p>• End with a conclusion or implication</p></>)}
                  {taskType === "answer_short_question" && (<><p>• Give a direct, concise answer</p><p>• One or two words is often enough</p></>)}
                  {taskType === "respond_to_situation" && (<><p>• Address the person directly (e.g. "Professor, I wanted to...")</p><p>• State the problem, your feelings, and what you need</p><p>• Use polite, natural language</p></>)}
                  {taskType === "summarize_group_discussion" && (<><p>• Name each speaker and their main point</p><p>• Note areas of agreement and disagreement</p><p>• End with the group's overall conclusion</p></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORDING PHASE ── */}
      {phase === "recording" && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-red-700 uppercase tracking-wider">Recording</span>
            </div>

            <CircularTimer total={timing.record} remaining={recordRemaining} phase="record" />

            {/* Mic icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center shadow-lg">
              <Mic className="w-7 h-7 text-red-500" />
            </div>

            {/* Real-time voice waveform (Web Audio API) */}
            <div className="w-full bg-white/60 rounded-xl border border-red-100 py-2">
              <LiveWaveform analyserRef={analyserRef} isActive={isRecording} />
              <p className="text-center text-[10px] text-red-300 mt-1">
                {isRecording ? "Voice waveform — speak now" : "Initialising microphone…"}
              </p>
            </div>

            {/* Live transcript */}
            {liveTranscript && (
              <div className="w-full bg-white/80 rounded-xl border border-red-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">Live Transcript</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{liveTranscript}"</p>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={stopRecording}
              className="border-red-300 text-red-600 hover:bg-red-50 mt-1"
            >
              <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Stop Recording
            </Button>

            <p className="text-xs text-red-400">Recording stops automatically when the timer ends</p>
          </div>
        </div>
      )}

      {/* ── DONE PHASE (before submission) ── */}
      {phase === "done" && !isSubmitted && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 border-4 border-green-400 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-500" />
            </div>
            <p className="text-sm font-bold text-green-700">Recording Complete</p>

            {liveTranscript && (
              <div className="w-full bg-white/80 rounded-xl border border-green-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">What You Said</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">"{liveTranscript}"</p>
              </div>
            )}

            {audioBlob && audioUrl && (
              <div className="w-full space-y-2">
                <p className="text-xs text-gray-500 mb-1.5 text-center">Review your recording:</p>
                <audio 
                  ref={audioRef}
                  controls 
                  src={audioUrl} 
                  className="w-full h-10 rounded-lg bg-white border border-green-200" 
                  controlsList="nodownload"
                />
                <p className="text-xs text-gray-400 text-center">Duration: {actualDuration.toFixed(1)}s</p>
              </div>
            )}

            <p className="text-xs text-green-500">Click Submit to get your AI score and pronunciation feedback</p>
          </div>
        </div>
      )}

      {/* ── POST-SUBMISSION: Pronunciation Analysis ── */}
      {isSubmitted && finalTranscript && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-teal-500" />
              <h4 className="text-sm font-bold text-gray-800">What You Said</h4>
              <Badge variant="outline" className="text-xs ml-auto">Whisper Transcription</Badge>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100 italic">
              "{finalTranscript}"
            </p>
          </div>

          {aligned && originalText && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-500" />
                <h4 className="text-sm font-bold text-gray-800">Pronunciation Analysis</h4>
                <span className="text-xs text-gray-400 ml-auto">Hover over words for details</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Original Text — Colour-Coded by Pronunciation
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <WordHighlight words={aligned} />
                  </div>
                </div>
                <ColourLegend />
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">✓ Original Text</p>
                    <p className="text-xs text-teal-800 leading-relaxed">{originalText}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">🎤 You Said</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{finalTranscript}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model audio after submission */}
          {modelText && (
            <ModelAudioPlayer text={modelText} taskType={taskType} />
          )}

          {fluency && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-bold text-gray-800">Fluency Metrics</h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">Based on your recording duration and word alignment</p>
              <FluencyMetrics {...fluency} />
              <div className="mt-3 bg-purple-50 rounded-xl p-3 border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 mb-1">PTE Speaking Speed Guide</p>
                <div className="flex gap-3 text-xs text-purple-600">
                  <span className="text-red-500">{"< 80 WPM"} = Too slow</span>
                  <span className="text-green-600">100–160 WPM = Ideal</span>
                  <span className="text-red-500">{"> 200 WPM"} = Too fast</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
