# Database

PostgreSQL via **Drizzle ORM** (`drizzle-orm/pg-core`), driven by
`postgres` (postgres-js). Source of truth: `drizzle/schema.ts`.

> **Dialect caveat:** the runtime schema, `drizzle.config.ts`,
> `drizzle/supabase_init.sql`, and `server/db.ts` are **PostgreSQL**. The
> migration files in `drizzle/migrations/` (0000–0003) and all seed scripts in
> `server/*.mjs` are **MySQL** — legacy, superseded.

## Connection

`server/db.ts`: `getDb()` lazy singleton —
`postgres(ENV.databaseUrl, { prepare: false, max: 1 })` + `drizzle(db)`.
Lazily degrades (returns null on unreachable DB) so public read paths still
respond. Indexes created in `supabase_init.sql`:
`idx_practice_sessions_user (practice_sessions.userId)`,
`idx_user_responses_session (userResponses.sessionId)`,
`idx_srs_cards_user_due (srs_cards.userId, dueDate)`.

## Enums (16)

| Enum | Values |
|---|---|
| `user_role` | `user`, `admin` |
| `current_level` | `beginner`, `intermediate`, `advanced` |
| `section` | `speaking`, `writing`, `reading`, `listening` |
| `difficulty` | `easy`, `medium`, `hard` |
| `session_type` | `mock_test`, `section_practice`, `diagnostic`, `revision`, `beginner` |
| `session_section` | `speaking`, `writing`, `reading`, `listening`, `full` |
| `session_mode` | `beginner`, `exam`, `diagnostic`, `revision` |
| `session_status` | `in_progress`, `completed`, `abandoned` |
| `srs_state` | `new`, `learning`, `review`, `relearning` |
| `plan_interval` | `monthly`, `yearly` |
| `subscription_status` | `active`, `inactive`, `canceled`, `expired` |
| `payment_gateway` | `esewa`, `khalti` |
| `payment_status` | `pending`, `completed`, `failed`, `refunded` |

## Tables (11)

### `users`
| Column | Type | Default |
|---|---|---|
| id | serial PK | |
| openId | varchar(128) NOT NULL UNIQUE | |
| name | text | |
| email | varchar(320) | |
| loginMethod | varchar(64) | |
| role | user_role | `user` |
| createdAt / updatedAt / lastSignedIn | timestamptz | now |
| targetScore | int | `65` |
| currentLevel | current_level | `intermediate` |
| dailyGoalMinutes | int | `30` |
| notificationsEnabled | boolean | `true` |

### `questions`
| Column | Type |
|---|---|
| id | serial PK |
| section | section NOT NULL |
| taskType | varchar(64) NOT NULL |
| difficulty | difficulty (`medium`) |
| title | varchar(255) NOT NULL |
| prompt | text |
| content | text |
| audioUrl | text |
| imageUrl | text |
| options | json |
| correctAnswer | text |
| modelAnswer | text |
| wordLimit / timeLimit / preparationTime | int |
| tags | json |
| createdAt | timestamptz (now) |

### `practice_sessions`
id, userId→users, sessionType (session_type NOT NULL),
section (session_section NOT NULL), mode (session_mode `exam`),
status (session_status `in_progress`), startedAt (now), completedAt,
totalQuestions / answeredQuestions (int 0),
overallScore · speakingScore · writingScore · readingScore · listeningScore ·
grammarScore · oralFluencyScore · pronunciationScore · spellingScore ·
vocabularyScore · writtenDiscourseScore (all doublePrecision),
weakSkills / strongSkills (json), actionPlan (text)

### `userResponses`
id, sessionId→practice_sessions, userId→users, questionId→questions,
responseText, audioUrl, transcription, selectedOptions (json), timeTaken,
submittedAt (now),
contentScore · formScore · languageScore · pronunciationScore ·
fluencyScore · totalScore · normalizedScore (doublePrecision),
feedback (text), strengths / improvements / grammarErrors (json),
vocabularyFeedback / pronunciationFeedback / fluencyFeedback (text),
isCorrect (boolean)

### `practiceTargets`
id, userId→users, targetDate (timestamptz NOT NULL),
targetMinutes (int 30), focusSkills (json), recommendedTasks (json),
completedMinutes (int 0), isCompleted (boolean false), createdAt (now)

### `srs_cards` — SM-2 spaced repetition
id, userId→users, questionId→questions,
**easeFactor** doublePrecision NOT NULL default `2.5`,
**interval** int NOT NULL default `1`,
**repetitions** int NOT NULL default `0`,
**lapses** int NOT NULL default `0`,
dueDate (timestamptz NOT NULL), lastReviewedAt,
totalReviews (int 0 NOT NULL), correctReviews (int 0 NOT NULL),
state (srs_state `new` NOT NULL), sourceResponseId→userResponses,
lastScore (doublePrecision), createdAt / updatedAt (now)

### `srs_review_logs`
id, cardId→srs_cards, userId→users, questionId→questions,
rating (int NOT NULL),
prevEaseFactor / newEaseFactor (doublePrecision NOT NULL),
prevInterval / prevRepetitions / newInterval / newRepetitions (int NOT NULL),
responseText, normalizedScore, reviewedAt (now)

### `subscription_plans`
id, name (varchar(64) NOT NULL), price (int NOT NULL),
interval (plan_interval NOT NULL), features (json NOT NULL),
maxSessions (int), storageGB (int), createdAt (now)

### `subscriptions`
id, userId→users, planId→subscription_plans,
status (subscription_status `active`), startDate (now),
endDate / renewalDate / canceledAt (timestamptz),
autoRenew (boolean true), createdAt / updatedAt (now)

### `payments`
id, userId→users, subscriptionId→subscriptions,
gateway (payment_gateway NOT NULL), amount (int NOT NULL),
currency (varchar(3) `NPR`), status (payment_status `pending`),
transactionId / referenceId (varchar(255)), description (text),
metadata (json), completedAt, createdAt / updatedAt (now)

### `milestones`
id, userId→users, milestoneType (varchar(64) NOT NULL),
title (varchar(255) NOT NULL), description (text),
achievedAt (now), isNotified (boolean false)

## Migrations

- `drizzle/migrations/{0000,0001,0002,0003}_*.sql` + `drizzle/meta/` — MySQL
  dialect, superseded by `drizzle.config.ts` (postgresql) + `db:push`.
  - 0000: users · 0001: questions, sessions, targets, responses, milestones ·
    0002: srs_cards, srs_review_logs · 0003: payments, subscription_plans,
    subscriptions.
- `drizzle/supabase_init.sql` — current hand-written PostgreSQL bootstrap
  (run in Supabase SQL Editor). Uses `jsonb` + `double precision`, adds the 3
  indexes above.

## Seed Scripts (all legacy MySQL)

| Script | Contents |
|---|---|
| `server/seed-questions.mjs` | 29 base questions, idempotent COUNT guard |
| `server/seed-official-questions.mjs` | ~80 official Pearson questions (Jan 2024 practice test + ISBN 9781447937944), `source='official'` column (not in schema), deletes prior official rows |
| `server/seed-new-speaking.mjs` | `respond_to_situation` ×12 + `summarize_group_discussion` ×10, title+taskType dedupe |
| `server/expand-questions.mjs` | "200+ across 20 task types", destructive reset (FK checks off, DELETE responses/sessions/questions), metadata → tags |

## DB Access Layer (`server/db.ts`)

Public functions: `upsertUser`, `getUserByOpenId`, `updateUserProfile`,
`getQuestions`, `getQuestionById`, `insertQuestion`, `getQuestionsCount`,
`createSession`, `getSessionById`, `updateSession`, `getUserSessions`,
`getSessionResponses`, `createResponse`, `updateResponse`, `getResponseById`,
`getUserAnalytics`, `getTodayTarget`, `upsertPracticeTarget`,
`getUserMilestones`, `createMilestone`, `getOrCreateSrsCard`, `getDueCards`,
`getUpcomingCards`, `updateSrsCard`, `logSrsReview`, `getSrsStats`,
`getSrsCardById`, `autoCreateSrsCardsFromSession`.

Payment tables have a separate layer in `server/payment/db.ts`;
admin/analytics queries in `server/admin/adminDb.ts` and
`server/admin/analyticsDb.ts`.