-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates all tables for the PTE Practice Platform

CREATE TYPE "user_role" AS ENUM ('user', 'admin');
CREATE TYPE "current_level" AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE "section" AS ENUM ('speaking', 'writing', 'reading', 'listening');
CREATE TYPE "difficulty" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "session_type" AS ENUM ('mock_test', 'section_practice', 'diagnostic', 'revision', 'beginner');
CREATE TYPE "session_section" AS ENUM ('speaking', 'writing', 'reading', 'listening', 'full');
CREATE TYPE "session_mode" AS ENUM ('beginner', 'exam', 'diagnostic', 'revision');
CREATE TYPE "session_status" AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE "srs_state" AS ENUM ('new', 'learning', 'review', 'relearning');
CREATE TYPE "plan_interval" AS ENUM ('monthly', 'yearly');
CREATE TYPE "subscription_status" AS ENUM ('active', 'inactive', 'canceled', 'expired');
CREATE TYPE "payment_gateway" AS ENUM ('esewa', 'khalti');
CREATE TYPE "payment_status" AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "openId" varchar(128) NOT NULL UNIQUE,
  "name" text,
  "email" varchar(320),
  "loginMethod" varchar(64),
  "role" "user_role" NOT NULL DEFAULT 'user',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "lastSignedIn" timestamptz NOT NULL DEFAULT now(),
  "targetScore" integer DEFAULT 65,
  "currentLevel" "current_level" DEFAULT 'intermediate',
  "dailyGoalMinutes" integer DEFAULT 30,
  "notificationsEnabled" boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS "questions" (
  "id" serial PRIMARY KEY,
  "section" "section" NOT NULL,
  "taskType" varchar(64) NOT NULL,
  "difficulty" "difficulty" NOT NULL DEFAULT 'medium',
  "title" varchar(255) NOT NULL,
  "prompt" text,
  "content" text,
  "audioUrl" text,
  "imageUrl" text,
  "options" jsonb,
  "correctAnswer" text,
  "modelAnswer" text,
  "wordLimit" integer,
  "timeLimit" integer,
  "preparationTime" integer,
  "tags" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "practice_sessions" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "sessionType" "session_type" NOT NULL,
  "section" "session_section" NOT NULL,
  "mode" "session_mode" NOT NULL DEFAULT 'exam',
  "status" "session_status" NOT NULL DEFAULT 'in_progress',
  "startedAt" timestamptz NOT NULL DEFAULT now(),
  "completedAt" timestamptz,
  "totalQuestions" integer DEFAULT 0,
  "answeredQuestions" integer DEFAULT 0,
  "overallScore" double precision,
  "speakingScore" double precision,
  "writingScore" double precision,
  "readingScore" double precision,
  "listeningScore" double precision,
  "grammarScore" double precision,
  "oralFluencyScore" double precision,
  "pronunciationScore" double precision,
  "spellingScore" double precision,
  "vocabularyScore" double precision,
  "writtenDiscourseScore" double precision,
  "weakSkills" jsonb,
  "strongSkills" jsonb,
  "actionPlan" text
);

CREATE TABLE IF NOT EXISTS "userResponses" (
  "id" serial PRIMARY KEY,
  "sessionId" integer NOT NULL REFERENCES "practice_sessions"("id"),
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "questionId" integer NOT NULL REFERENCES "questions"("id"),
  "responseText" text,
  "audioUrl" text,
  "transcription" text,
  "selectedOptions" jsonb,
  "timeTaken" integer,
  "submittedAt" timestamptz NOT NULL DEFAULT now(),
  "contentScore" double precision,
  "formScore" double precision,
  "languageScore" double precision,
  "pronunciationScore" double precision,
  "fluencyScore" double precision,
  "totalScore" double precision,
  "normalizedScore" double precision,
  "feedback" text,
  "strengths" jsonb,
  "improvements" jsonb,
  "grammarErrors" jsonb,
  "vocabularyFeedback" text,
  "pronunciationFeedback" text,
  "fluencyFeedback" text,
  "isCorrect" boolean
);

CREATE TABLE IF NOT EXISTS "practiceTargets" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "targetDate" timestamptz NOT NULL,
  "targetMinutes" integer DEFAULT 30,
  "focusSkills" jsonb,
  "recommendedTasks" jsonb,
  "completedMinutes" integer DEFAULT 0,
  "isCompleted" boolean DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "milestones" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "milestoneType" varchar(64) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "achievedAt" timestamptz NOT NULL DEFAULT now(),
  "isNotified" boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS "srs_cards" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "questionId" integer NOT NULL REFERENCES "questions"("id"),
  "easeFactor" double precision NOT NULL DEFAULT 2.5,
  "interval" integer NOT NULL DEFAULT 1,
  "repetitions" integer NOT NULL DEFAULT 0,
  "lapses" integer NOT NULL DEFAULT 0,
  "dueDate" timestamptz NOT NULL,
  "lastReviewedAt" timestamptz,
  "totalReviews" integer NOT NULL DEFAULT 0,
  "correctReviews" integer NOT NULL DEFAULT 0,
  "state" "srs_state" NOT NULL DEFAULT 'new',
  "sourceResponseId" integer REFERENCES "userResponses"("id"),
  "lastScore" double precision,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "srs_review_logs" (
  "id" serial PRIMARY KEY,
  "cardId" integer NOT NULL REFERENCES "srs_cards"("id"),
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "questionId" integer NOT NULL REFERENCES "questions"("id"),
  "rating" integer NOT NULL,
  "prevEaseFactor" double precision NOT NULL,
  "prevInterval" integer NOT NULL,
  "prevRepetitions" integer NOT NULL,
  "newEaseFactor" double precision NOT NULL,
  "newInterval" integer NOT NULL,
  "newRepetitions" integer NOT NULL,
  "responseText" text,
  "normalizedScore" double precision,
  "reviewedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscription_plans" (
  "id" serial PRIMARY KEY,
  "name" varchar(64) NOT NULL,
  "price" integer NOT NULL,
  "interval" "plan_interval" NOT NULL,
  "features" jsonb NOT NULL,
  "maxSessions" integer,
  "storageGB" integer,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "planId" integer NOT NULL REFERENCES "subscription_plans"("id"),
  "status" "subscription_status" NOT NULL DEFAULT 'active',
  "startDate" timestamptz NOT NULL DEFAULT now(),
  "endDate" timestamptz,
  "renewalDate" timestamptz,
  "autoRenew" boolean DEFAULT true,
  "canceledAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "payments" (
  "id" serial PRIMARY KEY,
  "userId" integer NOT NULL REFERENCES "users"("id"),
  "subscriptionId" integer REFERENCES "subscriptions"("id"),
  "gateway" "payment_gateway" NOT NULL,
  "amount" integer NOT NULL,
  "currency" varchar(3) NOT NULL DEFAULT 'NPR',
  "status" "payment_status" NOT NULL DEFAULT 'pending',
  "transactionId" varchar(255),
  "referenceId" varchar(255),
  "description" text,
  "metadata" jsonb,
  "completedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_practice_sessions_user" ON "practice_sessions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_user_responses_session" ON "userResponses" ("sessionId");
CREATE INDEX IF NOT EXISTS "idx_srs_cards_user_due" ON "srs_cards" ("userId", "dueDate");
