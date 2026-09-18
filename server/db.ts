import { eq, desc, and, gte, lte, gt, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  questions,
  practiceSessions,
  userResponses,
  practiceTargets,
  milestones,
  srsCards,
  srsReviewLogs,
  type Question,
  type PracticeSession,
  type UserResponse,
  type SrsCard,
  type InsertSrsCard,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { shouldCreateCard } from "./sm2";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _client = postgres(ENV.databaseUrl, { prepare: false, max: 1 });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    updateSet.updatedAt = new Date();
    if (Object.keys(updateSet).length === 1) updateSet.lastSignedIn = new Date();

    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(
  userId: number,
  data: {
    targetScore?: number;
    currentLevel?: "beginner" | "intermediate" | "advanced";
    dailyGoalMinutes?: number;
    notificationsEnabled?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getQuestions(filters: {
  section?: string;
  taskType?: string;
  difficulty?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(questions).$dynamic();
  const conditions = [];
  if (filters.section) conditions.push(eq(questions.section, filters.section as any));
  if (filters.taskType) conditions.push(eq(questions.taskType, filters.taskType));
  if (filters.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty as any));
  if (conditions.length > 0) query = query.where(and(...conditions));
  if (filters.limit) query = query.limit(filters.limit);
  return query;
}

export async function getQuestionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
  return result[0];
}

export async function insertQuestion(q: typeof questions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(questions).values(q);
}

export async function createSession(data: typeof practiceSessions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [row] = await db.insert(practiceSessions).values(data).returning({ id: practiceSessions.id });
  return row.id;
}

export async function getSessionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.id, id))
    .limit(1);
  return result[0];
}

export async function updateSession(id: number, data: Partial<PracticeSession>) {
  const db = await getDb();
  if (!db) return;
  await db.update(practiceSessions).set(data as any).where(eq(practiceSessions.id, id));
}

export async function getUserSessions(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(desc(practiceSessions.completedAt))
    .limit(limit);
}

export async function getSessionResponses(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  const responses = await db
    .select()
    .from(userResponses)
    .where(eq(userResponses.sessionId, sessionId));
  const withQuestions = await Promise.all(
    responses.map(async (r) => {
      const q = await getQuestionById(r.questionId);
      return { ...r, question: q || null };
    })
  );
  return withQuestions;
}

export async function createResponse(data: typeof userResponses.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [row] = await db.insert(userResponses).values(data).returning({ id: userResponses.id });
  return row.id;
}

export async function updateResponse(id: number, data: Partial<UserResponse>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userResponses).set(data as any).where(eq(userResponses.id, id));
}

export async function getUserAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "completed")))
    .orderBy(desc(practiceSessions.completedAt))
    .limit(50);

  const totalSessions = sessions.length;
  const latestSession = sessions[0];
  const avgScore =
    totalSessions > 0
      ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / totalSessions
      : 0;

  return { sessions, totalSessions, latestSession, avgScore };
}

export async function getTodayTarget(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await db
    .select()
    .from(practiceTargets)
    .where(and(eq(practiceTargets.userId, userId), gte(practiceTargets.targetDate, today)))
    .limit(1);
  return result[0] ?? null;
}

export async function upsertPracticeTarget(data: typeof practiceTargets.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(practiceTargets).values(data);
}

export async function getUserMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.userId, userId))
    .orderBy(desc(milestones.achievedAt))
    .limit(20);
}

export async function createMilestone(data: typeof milestones.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(milestones).values(data);
}

export async function getQuestionsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(questions);
  return result[0]?.count ?? 0;
}

export async function getOrCreateSrsCard(
  userId: number,
  questionId: number,
  sourceResponseId?: number,
  lastScore?: number
): Promise<SrsCard | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.questionId, questionId)))
    .limit(1);

  if (existing.length > 0) {
    if (
      lastScore !== undefined &&
      existing[0] &&
      (existing[0].lastScore === null || lastScore < (existing[0].lastScore ?? 100))
    ) {
      await db
        .update(srsCards)
        .set({
          lastScore,
          sourceResponseId: sourceResponseId ?? existing[0].sourceResponseId,
          updatedAt: new Date(),
        })
        .where(eq(srsCards.id, existing[0].id));
    }
    return existing[0] ?? null;
  }

  const dueDate = new Date();
  const values: InsertSrsCard = {
    userId,
    questionId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    lapses: 0,
    dueDate,
    totalReviews: 0,
    correctReviews: 0,
    state: "new",
    sourceResponseId,
    lastScore,
  };

  await db.insert(srsCards).values(values);

  const created = await db
    .select()
    .from(srsCards)
    .where(and(eq(srsCards.userId, userId), eq(srsCards.questionId, questionId)))
    .limit(1);

  return created[0] ?? null;
}

export async function getDueCards(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db
    .select({
      card: srsCards,
      question: questions,
    })
    .from(srsCards)
    .innerJoin(questions, eq(srsCards.questionId, questions.id))
    .where(and(eq(srsCards.userId, userId), lte(srsCards.dueDate, now)))
    .orderBy(asc(srsCards.dueDate), desc(srsCards.lapses))
    .limit(limit);
}

export async function getUpcomingCards(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db
    .select({ card: srsCards, question: questions })
    .from(srsCards)
    .innerJoin(questions, eq(srsCards.questionId, questions.id))
    .where(and(eq(srsCards.userId, userId), gt(srsCards.dueDate, now)))
    .orderBy(asc(srsCards.dueDate))
    .limit(limit);
}

export async function updateSrsCard(
  cardId: number,
  updates: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    lapses: number;
    state: "new" | "learning" | "review" | "relearning";
    dueDate: Date;
    isCorrect: boolean;
  }
) {
  const db = await getDb();
  if (!db) return;

  const [existing] = await db
    .select()
    .from(srsCards)
    .where(eq(srsCards.id, cardId))
    .limit(1);
  if (!existing) return;

  await db
    .update(srsCards)
    .set({
      easeFactor: updates.easeFactor,
      interval: updates.interval,
      repetitions: updates.repetitions,
      lapses: updates.lapses,
      state: updates.state,
      dueDate: updates.dueDate,
      lastReviewedAt: new Date(),
      updatedAt: new Date(),
      totalReviews: (existing.totalReviews ?? 0) + 1,
      correctReviews: updates.isCorrect
        ? (existing.correctReviews ?? 0) + 1
        : existing.correctReviews,
    })
    .where(eq(srsCards.id, cardId));
}

export async function logSrsReview(data: typeof srsReviewLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(srsReviewLogs).values(data);
}

export async function getSrsStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();

  const [totalCards, dueCards, reviewedToday, allCards] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(srsCards)
      .where(eq(srsCards.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(srsCards)
      .where(and(eq(srsCards.userId, userId), lte(srsCards.dueDate, now))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(srsReviewLogs)
      .where(
        and(
          eq(srsReviewLogs.userId, userId),
          gte(srsReviewLogs.reviewedAt, new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        )
      ),
    db
      .select({
        totalReviews: srsCards.totalReviews,
        correctReviews: srsCards.correctReviews,
        state: srsCards.state,
        lapses: srsCards.lapses,
      })
      .from(srsCards)
      .where(eq(srsCards.userId, userId)),
  ]);

  const totalReviews = allCards.reduce((s, c) => s + (c.totalReviews ?? 0), 0);
  const correctReviews = allCards.reduce((s, c) => s + (c.correctReviews ?? 0), 0);
  const retentionRate = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  const byState = allCards.reduce(
    (acc, c) => {
      acc[c.state] = (acc[c.state] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const recentLogs = await db
    .select({ reviewedAt: srsReviewLogs.reviewedAt, rating: srsReviewLogs.rating })
    .from(srsReviewLogs)
    .where(and(eq(srsReviewLogs.userId, userId), gte(srsReviewLogs.reviewedAt, fourteenDaysAgo)))
    .orderBy(asc(srsReviewLogs.reviewedAt));

  return {
    totalCards: totalCards[0]?.count ?? 0,
    dueNow: dueCards[0]?.count ?? 0,
    reviewedToday: reviewedToday[0]?.count ?? 0,
    retentionRate,
    byState,
    recentLogs,
  };
}

export async function getSrsCardById(cardId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(srsCards).where(eq(srsCards.id, cardId)).limit(1);
  return result[0] ?? null;
}

export async function autoCreateSrsCardsFromSession(userId: number, sessionId: number) {
  const db = await getDb();
  if (!db) return 0;

  const responses = await db
    .select()
    .from(userResponses)
    .where(and(eq(userResponses.sessionId, sessionId), eq(userResponses.userId, userId)));

  let created = 0;
  for (const response of responses) {
    const score = response.normalizedScore ?? 0;
    if (shouldCreateCard(score)) {
      const card = await getOrCreateSrsCard(userId, response.questionId, response.id, score);
      if (card) created++;
    }
  }
  return created;
}

export async function getResponseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userResponses).where(eq(userResponses.id, id)).limit(1);
  return result[0] ?? undefined;
}
