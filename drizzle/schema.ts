import {
  boolean,
  doublePrecision,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const currentLevelEnum = pgEnum("current_level", [
  "beginner",
  "intermediate",
  "advanced",
]);
export const sectionEnum = pgEnum("section", [
  "speaking",
  "writing",
  "reading",
  "listening",
]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const sessionTypeEnum = pgEnum("session_type", [
  "mock_test",
  "section_practice",
  "diagnostic",
  "revision",
  "beginner",
]);
export const sessionSectionEnum = pgEnum("session_section", [
  "speaking",
  "writing",
  "reading",
  "listening",
  "full",
]);
export const sessionModeEnum = pgEnum("session_mode", [
  "beginner",
  "exam",
  "diagnostic",
  "revision",
]);
export const sessionStatusEnum = pgEnum("session_status", [
  "in_progress",
  "completed",
  "abandoned",
]);
export const srsStateEnum = pgEnum("srs_state", [
  "new",
  "learning",
  "review",
  "relearning",
]);
export const planIntervalEnum = pgEnum("plan_interval", ["monthly", "yearly"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "inactive",
  "canceled",
  "expired",
]);
export const paymentGatewayEnum = pgEnum("payment_gateway", ["esewa", "khalti"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
  targetScore: integer("targetScore").default(65),
  currentLevel: currentLevelEnum("currentLevel").default("intermediate"),
  dailyGoalMinutes: integer("dailyGoalMinutes").default(30),
  notificationsEnabled: boolean("notificationsEnabled").default(true),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  section: sectionEnum("section").notNull(),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  difficulty: difficultyEnum("difficulty").default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  prompt: text("prompt"),
  content: text("content"),
  audioUrl: text("audioUrl"),
  imageUrl: text("imageUrl"),
  options: json("options"),
  correctAnswer: text("correctAnswer"),
  modelAnswer: text("modelAnswer"),
  wordLimit: integer("wordLimit"),
  timeLimit: integer("timeLimit"),
  preparationTime: integer("preparationTime"),
  tags: json("tags"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;

export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  sessionType: sessionTypeEnum("sessionType").notNull(),
  section: sessionSectionEnum("section").notNull(),
  mode: sessionModeEnum("mode").default("exam").notNull(),
  status: sessionStatusEnum("status").default("in_progress").notNull(),
  startedAt: timestamp("startedAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  totalQuestions: integer("totalQuestions").default(0),
  answeredQuestions: integer("answeredQuestions").default(0),
  overallScore: doublePrecision("overallScore"),
  speakingScore: doublePrecision("speakingScore"),
  writingScore: doublePrecision("writingScore"),
  readingScore: doublePrecision("readingScore"),
  listeningScore: doublePrecision("listeningScore"),
  grammarScore: doublePrecision("grammarScore"),
  oralFluencyScore: doublePrecision("oralFluencyScore"),
  pronunciationScore: doublePrecision("pronunciationScore"),
  spellingScore: doublePrecision("spellingScore"),
  vocabularyScore: doublePrecision("vocabularyScore"),
  writtenDiscourseScore: doublePrecision("writtenDiscourseScore"),
  weakSkills: json("weakSkills"),
  strongSkills: json("strongSkills"),
  actionPlan: text("actionPlan"),
});

export type PracticeSession = typeof practiceSessions.$inferSelect;

export const userResponses = pgTable("userResponses", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId")
    .notNull()
    .references(() => practiceSessions.id),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  questionId: integer("questionId")
    .notNull()
    .references(() => questions.id),
  responseText: text("responseText"),
  audioUrl: text("audioUrl"),
  transcription: text("transcription"),
  selectedOptions: json("selectedOptions"),
  timeTaken: integer("timeTaken"),
  submittedAt: timestamp("submittedAt", { withTimezone: true }).defaultNow().notNull(),
  contentScore: doublePrecision("contentScore"),
  formScore: doublePrecision("formScore"),
  languageScore: doublePrecision("languageScore"),
  pronunciationScore: doublePrecision("pronunciationScore"),
  fluencyScore: doublePrecision("fluencyScore"),
  totalScore: doublePrecision("totalScore"),
  normalizedScore: doublePrecision("normalizedScore"),
  feedback: text("feedback"),
  strengths: json("strengths"),
  improvements: json("improvements"),
  grammarErrors: json("grammarErrors"),
  vocabularyFeedback: text("vocabularyFeedback"),
  pronunciationFeedback: text("pronunciationFeedback"),
  fluencyFeedback: text("fluencyFeedback"),
  isCorrect: boolean("isCorrect"),
});

export type UserResponse = typeof userResponses.$inferSelect;

export const practiceTargets = pgTable("practiceTargets", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  targetDate: timestamp("targetDate", { withTimezone: true }).notNull(),
  targetMinutes: integer("targetMinutes").default(30),
  focusSkills: json("focusSkills"),
  recommendedTasks: json("recommendedTasks"),
  completedMinutes: integer("completedMinutes").default(0),
  isCompleted: boolean("isCompleted").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const srsCards = pgTable("srs_cards", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  questionId: integer("questionId")
    .notNull()
    .references(() => questions.id),
  easeFactor: doublePrecision("easeFactor").default(2.5).notNull(),
  interval: integer("interval").default(1).notNull(),
  repetitions: integer("repetitions").default(0).notNull(),
  lapses: integer("lapses").default(0).notNull(),
  dueDate: timestamp("dueDate", { withTimezone: true }).notNull(),
  lastReviewedAt: timestamp("lastReviewedAt", { withTimezone: true }),
  totalReviews: integer("totalReviews").default(0).notNull(),
  correctReviews: integer("correctReviews").default(0).notNull(),
  state: srsStateEnum("state").default("new").notNull(),
  sourceResponseId: integer("sourceResponseId").references(() => userResponses.id),
  lastScore: doublePrecision("lastScore"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type SrsCard = typeof srsCards.$inferSelect;
export type InsertSrsCard = typeof srsCards.$inferInsert;

export const srsReviewLogs = pgTable("srs_review_logs", {
  id: serial("id").primaryKey(),
  cardId: integer("cardId")
    .notNull()
    .references(() => srsCards.id),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  questionId: integer("questionId")
    .notNull()
    .references(() => questions.id),
  rating: integer("rating").notNull(),
  prevEaseFactor: doublePrecision("prevEaseFactor").notNull(),
  prevInterval: integer("prevInterval").notNull(),
  prevRepetitions: integer("prevRepetitions").notNull(),
  newEaseFactor: doublePrecision("newEaseFactor").notNull(),
  newInterval: integer("newInterval").notNull(),
  newRepetitions: integer("newRepetitions").notNull(),
  responseText: text("responseText"),
  normalizedScore: doublePrecision("normalizedScore"),
  reviewedAt: timestamp("reviewedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type SrsReviewLog = typeof srsReviewLogs.$inferSelect;

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  price: integer("price").notNull(),
  interval: planIntervalEnum("interval").notNull(),
  features: json("features").notNull(),
  maxSessions: integer("maxSessions"),
  storageGB: integer("storageGB"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  planId: integer("planId")
    .notNull()
    .references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate", { withTimezone: true }).defaultNow().notNull(),
  endDate: timestamp("endDate", { withTimezone: true }),
  renewalDate: timestamp("renewalDate", { withTimezone: true }),
  autoRenew: boolean("autoRenew").default(true),
  canceledAt: timestamp("canceledAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  subscriptionId: integer("subscriptionId").references(() => subscriptions.id),
  gateway: paymentGatewayEnum("gateway").notNull(),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("NPR").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  referenceId: varchar("referenceId", { length: 255 }),
  description: text("description"),
  metadata: json("metadata"),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  milestoneType: varchar("milestoneType", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  achievedAt: timestamp("achievedAt", { withTimezone: true }).defaultNow().notNull(),
  isNotified: boolean("isNotified").default(false),
});
