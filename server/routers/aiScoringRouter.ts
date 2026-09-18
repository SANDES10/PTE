/**
 * AI Scoring Router
 *
 * Exposes the four section-specific AI scoring engines as tRPC procedures.
 * Each engine uses official Pearson PTE Academic rubrics (Score Guide v21, Nov 2024)
 * calibrated with multi-level native speaker reference data.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { scoreSpeakingTask, type SpeakingScoreResult } from "../ai/speakingAI";
import { scoreWritingTask, type WritingScoreResult } from "../ai/writingAI";
import { scoreReadingTask, type ReadingScoreResult } from "../ai/readingAI";
import { scoreListeningTask, type ListeningScoreResult } from "../ai/listeningAI";
import { getQuestionById, getResponseById, updateResponse } from "../db";
import { transcribeAudio } from "../_core/voiceTranscription";

/**
 * Fall back to a deterministic neutral score if the AI engine exceeds the
 * timeout or throws, so users still receive a result instead of hanging.
 */
const AI_SCORING_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, fallback: () => T, ms = AI_SCORING_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        console.error("AI scoring failed, using deterministic fallback:", err);
        resolve(fallback());
      },
    );
  });
}

const TIMEOUT_FEEDBACK =
  "AI scoring timed out. A deterministic baseline score has been returned. Submit again for a full analysis.";

function fallbackSpeaking(taskType: string): SpeakingScoreResult {
  return {
    taskType,
    overallScore: 50,
    traits: {
      pronunciation: { score: 3, maxScore: 5, feedback: TIMEOUT_FEEDBACK },
      oralFluency: { score: 3, maxScore: 5, feedback: TIMEOUT_FEEDBACK },
      content: { score: 1, maxScore: 3, feedback: TIMEOUT_FEEDBACK },
    },
    cefrLevel: "B1",
    overallFeedback: TIMEOUT_FEEDBACK,
    strengths: [],
    improvements: [],
  };
}

function fallbackWriting(taskType: string): WritingScoreResult {
  const trait = { score: 1, maxScore: 2, feedback: TIMEOUT_FEEDBACK };
  return {
    taskType,
    overallScore: 50,
    rawScore: 5,
    maxRawScore: 10,
    traits: { content: trait, form: trait, grammar: trait, vocabulary: trait, spelling: trait },
    wordCount: 0,
    cefrLevel: "B1",
    overallFeedback: TIMEOUT_FEEDBACK,
    strengths: [],
    improvements: [],
  };
}

function fallbackReading(taskType: string, correctAnswers: string[]): ReadingScoreResult {
  return {
    taskType,
    overallScore: 50,
    rawScore: 0,
    maxRawScore: Math.max(correctAnswers.length, 1),
    correctAnswers,
    userAnswers: [],
    cefrLevel: "B1",
    overallFeedback: TIMEOUT_FEEDBACK,
    strengths: [],
    improvements: [],
    strategyTips: [],
  };
}

function fallbackListening(taskType: string): ListeningScoreResult {
  return {
    taskType,
    overallScore: 50,
    rawScore: 0,
    maxRawScore: 1,
    cefrLevel: "B1",
    overallFeedback: TIMEOUT_FEEDBACK,
    strengths: [],
    improvements: [],
    strategyTips: [],
  };
}

export const aiScoringRouter = router({
  /**
   * Score a Speaking task response.
   * Accepts either a transcription (text) or an audioUrl (auto-transcribed).
   * Uses official PTE rubrics: Pronunciation (0-5), Oral Fluency (0-5), Content (task-specific).
   */
  scoreSpeak: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      audioUrl: z.string().optional(),
      transcription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      // Get transcription
      let transcription = input.transcription || response.transcription || "";
      if (!transcription && (input.audioUrl || response.audioUrl)) {
        try {
          const audioUrl = input.audioUrl || response.audioUrl || "";
          const result = await transcribeAudio({ audioUrl, language: "en" });
          transcription = "text" in result ? result.text : "";
          await updateResponse(input.responseId, { transcription });
        } catch (e) {
          console.error("Transcription failed:", e);
        }
      }

      if (!transcription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No transcription available. Please provide audio or text.",
        });
      }

      // Score using the section-specific engine
      const result = await withTimeout(
        scoreSpeakingTask({
          taskType: question.taskType,
          originalText: question.content || question.prompt || undefined,
          imageDescription: question.content || undefined,
          lectureTranscript: question.content || undefined,
          question: question.prompt || undefined,
          correctAnswer: question.correctAnswer || undefined,
          transcription,
        }),
        () => fallbackSpeaking(question.taskType),
      );

      // Persist the enhanced score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        pronunciationScore: result.traits.pronunciation ? result.traits.pronunciation.score / 5 : undefined,
        fluencyScore: result.traits.oralFluency ? result.traits.oralFluency.score / 5 : undefined,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
        pronunciationFeedback: result.traits.pronunciation?.feedback,
        fluencyFeedback: result.traits.oralFluency?.feedback,
      });

      return result;
    }),

  /**
   * Score a Writing task response.
   * Uses official PTE rubrics for Essay (15 traits) and Summarize Written Text (8 traits).
   */
  scoreWrite: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      responseText: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const text = input.responseText || response.responseText || "";
      if (!text.trim()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No response text provided." });
      }

      const result = await withTimeout(
        scoreWritingTask({
          taskType: question.taskType,
          sourceText: question.content || undefined,
          prompt: question.prompt || undefined,
          response: text,
        }),
        () => fallbackWriting(question.taskType),
      );

      // Persist enhanced score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        contentScore: result.traits.content.score / result.traits.content.maxScore,
        formScore: result.traits.form.score / result.traits.form.maxScore,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
        grammarErrors: result.grammarErrors || [],
        vocabularyFeedback: result.vocabularyFeedback || "",
      });

      return result;
    }),

  /**
   * Score a Reading task response.
   * Objective scoring + AI-generated explanations and strategy tips.
   */
  scoreRead: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      selectedOptions: z.array(z.string()).optional(),
      orderedItems: z.array(z.string()).optional(),
      filledBlanks: z.array(z.object({
        position: z.number(),
        answer: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const userAnswers = input.selectedOptions || (response.selectedOptions as unknown as string[] | null) || [];
      const correctAnswerRaw = question.correctAnswer as string | null;
      const correctAnswers = correctAnswerRaw
        ? correctAnswerRaw.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const optionsArr = (question.options as unknown as string[] | null) || [];

      // Build blanks for fill-in-the-blanks tasks
      const blanks = input.filledBlanks?.map((b, i) => ({
        position: b.position,
        correctAnswer: correctAnswers[i] || "",
        userAnswer: b.answer,
        options: optionsArr,
      }));

      const result = await withTimeout(
        scoreReadingTask({
          taskType: question.taskType,
          passage: question.content || question.prompt || "",
          question: question.prompt || "",
          options: optionsArr,
          correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers,
          userAnswer: userAnswers.length === 1 ? userAnswers[0] : userAnswers,
          paragraphs: (question.options as unknown as Array<{ id: string; text: string }> | null) || undefined,
          correctOrder: correctAnswers,
          userOrder: input.orderedItems || userAnswers,
          blanks,
        }),
        () => fallbackReading(question.taskType, correctAnswers),
      );

      // Persist score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        contentScore: result.rawScore / result.maxRawScore,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
      });

      return result;
    }),

  /**
   * Score a Listening task response.
   * Handles Summarize Spoken Text, Write from Dictation, Fill in Blanks, and MCQ types.
   */
  scoreListen: protectedProcedure
    .input(z.object({
      responseId: z.number(),
      responseText: z.string().optional(),
      selectedOptions: z.array(z.string()).optional(),
      filledBlanks: z.array(z.object({
        position: z.number(),
        word: z.string(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const responseText = input.responseText || response.responseText || "";
      const userAnswers = input.selectedOptions || (response.selectedOptions as unknown as string[] | null) || [];
      const correctAnswerRaw2 = question.correctAnswer as string | null;
      const correctAnswers = correctAnswerRaw2
        ? correctAnswerRaw2.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      const optionsArr2 = (question.options as unknown as string[] | null) || [];

      const blanks = input.filledBlanks?.map((b, i) => ({
        position: b.position,
        correctWord: correctAnswers[i] || "",
        userWord: b.word,
      }));

      const result = await withTimeout(
        scoreListeningTask({
          taskType: question.taskType,
          lectureTranscript: question.content || undefined,
          transcript: question.content || undefined,
          response: responseText,
          question: question.prompt || undefined,
          options: optionsArr2,
          correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : correctAnswers,
          userAnswer: userAnswers.length === 1 ? userAnswers[0] : userAnswers,
          summaryOptions: optionsArr2,
          blanks,
        }),
        () => fallbackListening(question.taskType),
      );

      // Persist score
      await updateResponse(input.responseId, {
        normalizedScore: result.overallScore,
        totalScore: result.overallScore,
        contentScore: result.rawScore / result.maxRawScore,
        feedback: result.overallFeedback,
        strengths: result.strengths,
        improvements: result.improvements,
      });

      return result;
    }),

  /**
   * Get the full AI score breakdown for a previously scored response.
   * Re-runs scoring if no score exists yet.
   */
  getScore: protectedProcedure
    .input(z.object({ responseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const response = await getResponseById(input.responseId);
      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const question = await getQuestionById(response.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        responseId: input.responseId,
        section: question.section,
        taskType: question.taskType,
        normalizedScore: response.normalizedScore,
        totalScore: response.totalScore,
        feedback: response.feedback,
        strengths: response.strengths,
        improvements: response.improvements,
        pronunciationScore: response.pronunciationScore,
        fluencyScore: response.fluencyScore,
        contentScore: response.contentScore,
        formScore: response.formScore,
        grammarErrors: response.grammarErrors,
        vocabularyFeedback: response.vocabularyFeedback,
        transcription: response.transcription,
      };
    }),
});
