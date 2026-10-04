import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getQuestions, getQuestionById, createSession, getSessionById, updateSession,
  getUserSessions, createResponse, updateResponse, getSessionResponses,
  getUserAnalytics, getTodayTarget, upsertPracticeTarget, getUserMilestones,
  createMilestone, updateUserProfile, getQuestionsCount,
  getDueCards, getUpcomingCards, getOrCreateSrsCard, updateSrsCard, logSrsReview,
  getSrsStats, getSrsCardById, autoCreateSrsCardsFromSession, getResponseById,
} from "./db";
import {
  computeSm2, scoreToRating, getIntervalPreviews, getRatingLabel, type SrsRating,
} from "./sm2";
import {
  scoreWritingTask, scoreSpeakingTask, scoreObjectiveTask,
  generateDiagnosticFeedback, normalizeToPTE,
} from "./scoring";
import { generateTaskFeedback, generateCoachingPlan, generateMicroFeedback } from "./aiCoach";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { notifyOwner } from "./_core/notification";
import { aiScoringRouter } from "./routers/aiScoringRouter";
import { paymentRouter } from "./routers/paymentRouter";
import { systemAdminRouter } from "./routers/systemAdminRouter";

// Questions router
const questionsRouter = router({
  list: publicProcedure
    .input(z.object({
      section: z.enum(["speaking", "writing", "reading", "listening"]).optional(),
      taskType: z.string().optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      limit: z.number().min(1).max(200).optional(),
    }))
    .query(async ({ input }) => {
      return getQuestions(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const q = await getQuestionById(input.id);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      return q;
    }),

  count: publicProcedure.query(async () => {
    return getQuestionsCount();
  }),
});

// Sessions router
const sessionsRouter = router({
  create: protectedProcedure
    .input(z.object({
      sessionType: z.enum(["mock_test", "section_practice", "diagnostic", "revision", "beginner"]),
      section: z.enum(["speaking", "writing", "reading", "listening", "full"]).optional(),
      mode: z.enum(["beginner", "exam", "diagnostic", "revision"]).default("exam"),
      totalQuestions: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createSession({
        userId: ctx.user.id,
        ...input,
        section: input.section || "full",
        status: "in_progress",
      });
      return { id };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return session;
    }),

  complete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const responses = await getSessionResponses(input.id);

      // Calculate aggregate scores
      const speakingResponses = responses.filter(r => r.pronunciationScore !== null);
      const writingResponses = responses.filter(r => r.languageScore !== null && r.pronunciationScore === null);
      const allScored = responses.filter(r => r.normalizedScore !== null);

      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;

      const speakingScore = avg(speakingResponses.map(r => r.normalizedScore || 50));
      const writingScore = avg(writingResponses.map(r => r.normalizedScore || 50));
      const overallScore = avg(allScored.map(r => r.normalizedScore || 50));

      // Aggregate enabling skills
      const grammarScore = avg(responses.filter(r => r.languageScore).map(r => normalizeToPTE((r.languageScore || 0.5) * 100)));
      const pronunciationScore = avg(speakingResponses.map(r => normalizeToPTE((r.pronunciationScore || 0.5) * 100)));
      const fluencyScore = avg(speakingResponses.map(r => normalizeToPTE((r.fluencyScore || 0.5) * 100)));

      const updateData = {
        status: "completed" as const,
        completedAt: new Date(),
        answeredQuestions: responses.length,
        overallScore: overallScore || 50,
        speakingScore: speakingScore,
        writingScore: writingScore,
        grammarScore: grammarScore,
        pronunciationScore: pronunciationScore,
        oralFluencyScore: fluencyScore,
      };

      await updateSession(input.id, updateData);

      // Generate diagnostic feedback
      if (overallScore) {
        const diagnostic = await generateDiagnosticFeedback({
          overallScore: overallScore,
          speakingScore,
          writingScore,
          grammarScore,
          pronunciationScore,
          fluencyScore,
          targetScore: 65,
        });

        await updateSession(input.id, {
          weakSkills: diagnostic.weakSkills,
          strongSkills: diagnostic.strongSkills,
          actionPlan: diagnostic.actionPlan,
        });

        // Check for milestones
        if (overallScore >= 65) {
          await createMilestone({
            userId: ctx.user.id,
            milestoneType: "score_reached",
            title: "Score Goal Achieved!",
            description: `You reached an overall score of ${Math.round(overallScore)}/90`,
          });
        }
      }

      return { success: true, overallScore };
    }),

  getReport: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.id);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const responses = await getSessionResponses(input.id);
      // Build enabling skills from response data
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;
      const spk = responses.filter(r => r.pronunciationScore !== null);
      const wrt = responses.filter(r => r.languageScore !== null && r.pronunciationScore === null);
      const allScored = responses.filter(r => r.normalizedScore !== null);
      const enablingSkills: Record<string, number> = {};
      const grammar = avg(responses.filter(r => r.languageScore).map(r => normalizeToPTE((r.languageScore || 0.5) * 100)));
      const pronunciation = avg(spk.map(r => normalizeToPTE((r.pronunciationScore || 0.5) * 100)));
      const fluency = avg(spk.map(r => normalizeToPTE((r.fluencyScore || 0.5) * 100)));
      const vocab = avg(responses.filter(r => r.contentScore).map(r => normalizeToPTE((r.contentScore || 0.5) * 100)));
      if (grammar) enablingSkills.grammar = grammar;
      if (pronunciation) enablingSkills.pronunciation = pronunciation;
      if (fluency) enablingSkills.oral_fluency = fluency;
      if (vocab) enablingSkills.vocabulary = vocab;
      const readingResp = responses.filter(r => r.question?.section === "reading");
      const listeningResp = responses.filter(r => r.question?.section === "listening");
      const readingScore = avg(readingResp.filter(r => r.normalizedScore).map(r => r.normalizedScore!));
      const listeningScore = avg(listeningResp.filter(r => r.normalizedScore).map(r => r.normalizedScore!));
      if (readingScore) enablingSkills.reading_skills = readingScore;
      if (listeningScore) enablingSkills.listening_skills = listeningScore;
      const speakingScore = avg(spk.map(r => r.normalizedScore!).filter(Boolean));
      const writingScore = avg(wrt.map(r => r.normalizedScore!).filter(Boolean));
      const overallScore = avg(allScored.map(r => r.normalizedScore!));
      const diagnostic = session.actionPlan ? `${session.actionPlan}` : null;
      const plan = session.weakSkills ? `Focus on improving: ${Array.isArray(session.weakSkills) ? session.weakSkills.join(", ") : session.weakSkills}` : null;
      return {
        ...session,
        overallScore: overallScore || session.overallScore,
        speakingScore: speakingScore || session.speakingScore,
        writingScore: writingScore || session.writingScore,
        readingScore: readingScore || session.readingScore,
        listeningScore: listeningScore || session.listeningScore,
        enablingSkills,
        diagnosticFeedback: diagnostic,
        improvementPlan: plan,
        responses: responses.map(r => ({ ...r, question: r.question })),
      };
    }),

  myHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return getUserSessions(ctx.user.id, input.limit);
    }),

  getResponses: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session || session.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return getSessionResponses(input.sessionId);
    }),
});

// Responses router
const responsesRouter = router({
  submit: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      questionId: z.number(),
      responseText: z.string().optional(),
      audioUrl: z.string().optional(),
      selectedOptions: z.array(z.string()).optional(),
      timeTaken: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const question = await getQuestionById(input.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const responseId = await createResponse({
        sessionId: input.sessionId,
        userId: ctx.user.id,
        questionId: input.questionId,
        responseText: input.responseText,
        audioUrl: input.audioUrl,
        selectedOptions: input.selectedOptions,
        timeTaken: input.timeTaken,
      });

      // Score based on task type
      let scoreData: Partial<typeof import("../drizzle/schema").userResponses.$inferInsert> = {};

      if (question.section === "writing" && input.responseText) {
        const result = await scoreWritingTask({
          taskType: question.taskType as any,
          prompt: question.prompt || "",
          content: question.content || undefined,
          response: input.responseText,
          wordLimit: question.wordLimit || undefined,
        });
        scoreData = {
          contentScore: result.contentScore,
          formScore: result.formScore,
          languageScore: result.languageScore,
          totalScore: result.totalScore,
          normalizedScore: result.normalizedScore,
          feedback: result.feedback,
          strengths: result.strengths,
          improvements: result.improvements,
          grammarErrors: result.grammarErrors,
          vocabularyFeedback: result.vocabularyFeedback,
        };
      } else if (question.section === "speaking" && input.audioUrl) {
        // Transcribe audio first
        let transcription = "";
        try {
          const transcribeResult = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
          transcription = 'text' in transcribeResult ? transcribeResult.text : "";
          await updateResponse(responseId, { transcription });
        } catch (e) {
          console.error("Transcription failed:", e);
          transcription = input.responseText || "";
        }

        if (transcription) {
          const result = await scoreSpeakingTask({
            taskType: question.taskType as any,
            prompt: question.prompt || undefined,
            originalText: question.content || undefined,
            transcription,
          });
          scoreData = {
            contentScore: result.contentScore,
            formScore: result.formScore,
            languageScore: result.languageScore,
            pronunciationScore: result.pronunciationScore,
            fluencyScore: result.fluencyScore,
            totalScore: result.totalScore,
            normalizedScore: result.normalizedScore,
            feedback: result.feedback,
            strengths: result.strengths,
            improvements: result.improvements,
            grammarErrors: result.grammarErrors,
            vocabularyFeedback: result.vocabularyFeedback,
            pronunciationFeedback: result.pronunciationFeedback,
            fluencyFeedback: result.fluencyFeedback,
          };
        }
      } else if (["reading", "listening"].includes(question.section)) {
        const result = scoreObjectiveTask({
          taskType: question.taskType,
          correctAnswer: question.correctAnswer ?? "",
          userAnswer: input.selectedOptions ?? input.responseText ?? "",
        });
        scoreData = {
          normalizedScore: result.normalizedScore,
          contentScore: result.score > 50 ? 1 : 0,
          formScore: 1,
          languageScore: 0.5,
        };
      }

      await updateResponse(responseId, scoreData);

      // Update session answered count
      const session = await getSessionById(input.sessionId);
      if (session) {
        await updateSession(input.sessionId, {
          answeredQuestions: (session.answeredQuestions || 0) + 1,
        });
      }

      // Fetch the saved response to get the Whisper transcription
      // (transcription is saved separately before scoreData update)
      let savedTranscription: string | undefined;
      if (question.section === "speaking") {
        try {
          const saved = await getResponseById(responseId);
          savedTranscription = saved?.transcription ?? undefined;
        } catch {}
      }

      return { responseId, ...scoreData, transcription: savedTranscription };
    }),

  transcribeAudio: protectedProcedure
    .input(z.object({ audioUrl: z.string() }))
    .mutation(async ({ input }) => {
      const result = await transcribeAudio({ audioUrl: input.audioUrl, language: "en" });
      const transcription = 'text' in result ? result.text : "";
      return { transcription };
    }),
});

// Analytics router
const analyticsRouter = router({
  myStats: protectedProcedure.query(async ({ ctx }) => {
    return getUserAnalytics(ctx.user.id);
  }),

  todayTarget: protectedProcedure.query(async ({ ctx }) => {
    return getTodayTarget(ctx.user.id);
  }),

  milestones: protectedProcedure.query(async ({ ctx }) => {
    return getUserMilestones(ctx.user.id);
  }),

  generateTarget: protectedProcedure
    .input(z.object({
      targetMinutes: z.number().default(30),
      focusSkills: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await upsertPracticeTarget({
        userId: ctx.user.id,
        targetDate: today,
        targetMinutes: input.targetMinutes,
        focusSkills: input.focusSkills || ["speaking", "writing"],
        recommendedTasks: ["read_aloud", "write_essay", "multiple_choice_single"],
      });
      return { success: true };
    }),
});

// AI Coach router
const aiCoachRouter = router({
  // Get detailed AI feedback for a specific response
  getTaskFeedback: protectedProcedure
    .input(z.object({
      responseId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import("./db");
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { userResponses, questions } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const [response] = await db
        .select()
        .from(userResponses)
        .where(eq(userResponses.id, input.responseId))
        .limit(1);

      if (!response || response.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, response.questionId))
        .limit(1);

      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const feedback = await generateTaskFeedback({
        taskType: question.taskType,
        question: question.prompt || question.content || "",
        userResponse: response.responseText || response.transcription || "",
        correctAnswer: question.correctAnswer || undefined,
        score: response.totalScore || 0,
        transcription: response.transcription || undefined,
      });

      return feedback;
    }),

  // Generate personalized coaching plan
  getCoachingPlan: protectedProcedure
    .input(z.object({
      targetScore: z.number().min(10).max(90).default(65),
    }))
    .mutation(async ({ ctx, input }) => {
      const sessions = await getUserSessions(ctx.user.id, 20);
      const analytics = await getUserAnalytics(ctx.user.id);

      const recentScores = sessions
        .filter(s => s.overallScore)
        .map(s => ({
          taskType: s.sessionType,
          section: s.section || "full",
          score: s.overallScore || 50,
          createdAt: s.completedAt || new Date(),
        }));

      const plan = await generateCoachingPlan({
        userId: ctx.user.id,
        targetScore: input.targetScore,
        currentLevel: ctx.user.currentLevel || "intermediate",
        recentScores,
        skillScores: {
          grammar: undefined,
          pronunciation: undefined,
          fluency: undefined,
        },
      });

      return plan;
    }),

  // Get micro-feedback for a specific error
  getMicroFeedback: protectedProcedure
    .input(z.object({
      taskType: z.string(),
      errorType: z.string(),
      studentExample: z.string(),
      correctExample: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return generateMicroFeedback(input);
    }),

  // Get AI-powered response to a practice question (for Beginner Mode)
  getModelAnswer: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      taskType: z.string(),
    }))
    .query(async ({ input }) => {
      const question = await getQuestionById(input.questionId);
      if (!question) throw new TRPCError({ code: "NOT_FOUND" });

      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a PTE Academic expert. Provide a model answer for this ${input.taskType.replace(/_/g, " ")} task that would score 90/90. Include brief annotations explaining why each part is effective.`
          },
          {
            role: "user",
            content: `Task: ${question.prompt || question.content}\n\nProvide a model answer with brief annotations.`
          }
        ]
      });

      const content = result.choices[0]?.message?.content as string;
      return { modelAnswer: content, question };
    }),
});

// Profile router
const profileRouter = router({
  update: protectedProcedure
    .input(z.object({
      targetScore: z.number().min(10).max(90).optional(),
      currentLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      dailyGoalMinutes: z.number().min(5).max(240).optional(),
      notificationsEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});

// ─── SRS Router ─────────────────────────────────────────────────────────────
const srsRouter = router({
  /**
   * Get all cards due for review today, with question content.
   */
  getDueCards: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const rows = await getDueCards(ctx.user.id, input.limit);
      return rows.map(({ card, question }) => ({
        card,
        question,
        intervalPreviews: getIntervalPreviews({
          easeFactor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          lapses: card.lapses,
          state: card.state,
        }),
      }));
    }),

  /**
   * Get upcoming cards (not yet due) for planning.
   */
  getUpcomingCards: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      return getUpcomingCards(ctx.user.id, input.limit);
    }),

  /**
   * Get SRS statistics for the current user.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getSrsStats(ctx.user.id);
  }),

  /**
   * Record a review for a card and update its SM-2 schedule.
   * rating: 1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect
   */
  recordReview: protectedProcedure
    .input(z.object({
      cardId: z.number(),
      rating: z.number().min(1).max(5),
      responseText: z.string().optional(),
      normalizedScore: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const card = await getSrsCardById(input.cardId);
      if (!card || card.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }

      const rating = input.rating as SrsRating;
      const sm2Result = computeSm2({
        easeFactor: card.easeFactor,
        interval: card.interval,
        repetitions: card.repetitions,
        lapses: card.lapses,
        state: card.state,
        rating,
      });

      const isCorrect = rating >= 3;

      // Update the card
      await updateSrsCard(card.id, {
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        lapses: sm2Result.lapses,
        state: sm2Result.state,
        dueDate: sm2Result.dueDate,
        isCorrect,
      });

      // Log the review
      await logSrsReview({
        cardId: card.id,
        userId: ctx.user.id,
        questionId: card.questionId,
        rating,
        prevEaseFactor: card.easeFactor,
        prevInterval: card.interval,
        prevRepetitions: card.repetitions,
        newEaseFactor: sm2Result.easeFactor,
        newInterval: sm2Result.interval,
        newRepetitions: sm2Result.repetitions,
        responseText: input.responseText,
        normalizedScore: input.normalizedScore,
      });

      return {
        success: true,
        nextInterval: sm2Result.interval,
        nextDueDate: sm2Result.dueDate,
        ratingLabel: getRatingLabel(rating),
        newState: sm2Result.state,
      };
    }),

  /**
   * Manually add a question to the SRS deck.
   */
  addCard: protectedProcedure
    .input(z.object({
      questionId: z.number(),
      sourceResponseId: z.number().optional(),
      lastScore: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const card = await getOrCreateSrsCard(
        ctx.user.id,
        input.questionId,
        input.sourceResponseId,
        input.lastScore
      );
      return { success: true, card };
    }),

  /**
   * Auto-create SRS cards from a completed session (called after session submit).
   */
  autoCreateFromSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const count = await autoCreateSrsCardsFromSession(ctx.user.id, input.sessionId);
      return { success: true, cardsCreated: count };
    }),

  /**
   * Reset a card back to "new" state (useful if user wants to relearn from scratch).
   */
  resetCard: protectedProcedure
    .input(z.object({ cardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const card = await getSrsCardById(input.cardId);
      if (!card || card.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }
      await updateSrsCard(card.id, {
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        lapses: card.lapses,
        state: "new",
        dueDate: new Date(),
        isCorrect: false,
      });
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  questions: questionsRouter,
  sessions: sessionsRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
  profile: profileRouter,
  aiCoach: aiCoachRouter,
  srs: srsRouter,
  aiScoring: aiScoringRouter,
  payment: paymentRouter,
  systemAdmin: systemAdminRouter,
});

export type AppRouter = typeof appRouter;
