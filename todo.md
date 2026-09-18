# PTE Academic Practice Platform - TODO

## Database & Backend
- [x] Extended database schema: practice_sessions, questions, user_responses, scores, skill_scores, notifications
- [x] Question bank seeding with all PTE task types
- [x] tRPC routers: questions, sessions, scoring, analytics, notifications
- [x] LLM scoring engine for writing tasks (essay, summarize written text)
- [x] LLM scoring engine for speaking tasks (read aloud, repeat sentence, describe image)
- [x] Audio transcription integration for speaking tasks
- [x] Score normalization logic (10-90 scale)
- [x] Progress tracking and analytics queries
- [x] Audio upload endpoint (/api/upload-audio)
- [x] Partial credit scoring for Write from Dictation, Reorder Paragraphs, Highlight Incorrect Words

## Frontend - Layout & Navigation
- [x] Global design system (colors, typography, spacing)
- [x] Landing/home page with feature highlights and CTA
- [x] Dashboard layout with sidebar navigation
- [x] Authentication flow (login/logout)
- [x] User profile page

## Frontend - Practice Modules
- [x] Speaking module: Read Aloud
- [x] Speaking module: Repeat Sentence
- [x] Speaking module: Describe Image
- [x] Speaking module: Re-tell Lecture
- [x] Speaking module: Answer Short Question
- [x] Writing module: Summarize Written Text
- [x] Writing module: Write Essay
- [x] Reading module: Multiple Choice (Single)
- [x] Reading module: Multiple Choice (Multiple)
- [x] Reading module: Re-order Paragraphs
- [x] Reading module: Fill in the Blanks (Reading)
- [x] Reading module: Fill in the Blanks (Reading & Writing)
- [x] Listening module: Summarize Spoken Text
- [x] Listening module: Multiple Choice (Single/Multiple)
- [x] Listening module: Fill in the Blanks (Listening)
- [x] Listening module: Highlight Correct Summary
- [x] Listening module: Select Missing Word
- [x] Listening module: Highlight Incorrect Words
- [x] Listening module: Write from Dictation
- [x] Audio recording component with waveform visualization
- [x] Countdown timer component for timed tasks

## Frontend - Score & Feedback
- [x] Score report page (Overall + Communicative Skills + Enabling Skills)
- [x] Diagnostic feedback panel with weakness identification
- [x] Action plan and improvement strategies
- [x] Task-specific guidance and tips

## Frontend - Analytics & Progress
- [x] Progress analytics dashboard with charts
- [x] Score trends over time visualization
- [x] Skill development radar chart
- [x] Performance history table

## Frontend - Mock Test & Learning Modes
- [x] Full mock test simulation (all 4 sections, timed)
- [x] Section-wise practice mode
- [x] Beginner Mode (guided + templates)
- [x] Exam Mode (strict, timed, real scoring)
- [x] Diagnostic Mode (weakness detection)
- [x] Revision Mode (high-impact practice)
- [x] Daily practice targets and roadmap page
- [x] Progress reminders and milestone notifications

## Testing
- [x] auth.logout test
- [x] normalizeToPTE unit tests (6 cases)
- [x] scoreObjectiveTask unit tests (14 cases — MCQ, dictation, reorder, highlight, fill blanks)
- [x] questions.list integration tests
- [x] All 24 tests passing

## Static Results Webpage
- [x] Interactive results overview static webpage
- [x] Score visualization charts (radar, bar, line)
- [x] Skill breakdown interactive display
- [x] Shareable/saveable results page
- [x] Interactive score simulator with sliders
- [x] Improvement roadmap (dynamic)
- [x] Task type tabs for all 20 task types
- [x] Feature comparison table

## Phase 2 — APEUni Redesign & AI Coaching (Completed)
- [x] APEUni-style teal/cyan color scheme and dark sidebar
- [x] PTEMaster branding with teal accent
- [x] Home landing page redesigned in APEUni style
- [x] Dashboard redesigned with dark sidebar and study stats
- [x] AI coaching engine (aiCoach.ts) with task-specific personalized feedback
- [x] AI coaching plan router (getTaskFeedback, getCoachingPlan)
- [x] AIFeedbackPanel component (criterion scoring, error analysis, improvement tips, model answers)
- [x] CoachingPlan page (4-week roadmap, skill gap analysis, daily schedule)
- [x] Integrated AIFeedbackPanel into PracticeSession after submission
- [x] Added AI Coaching Plan to sidebar navigation
- [x] Question bank expanded to 127+ questions (expand-questions.mjs)
- [x] Overview webpage enhanced: AI Feedback preview, 4-week roadmap, skill gap chart, daily schedule

## Phase 3 — Spaced Repetition System (COMPLETED)
- [x] Add spaced_repetition_cards table to schema (SM-2 fields: easeFactor, interval, repetitions, dueDate, lastReviewedAt, totalReviews, lapses)
- [x] Add srs_review_logs table for full review history
- [x] Run migration SQL
- [x] Implement SM-2 algorithm in server/sm2.ts
- [x] Add SRS tRPC router (getDueCards, recordReview, getStats, resetCard, addCard, autoCreateFromSession, resetCard)
- [x] Auto-create SRS cards when a response scores below threshold (shouldCreateCard, autoCreateSrsCardsFromSession)
- [x] Build RevisionMode page with SRS deck UI (card flip, difficulty rating 1-5, keyboard shortcuts)
- [x] Build SRS stats panel (due today, reviewed today, total cards, retention rate)
- [x] Build 14-day review heatmap with colour-coded activity
- [x] Build deck composition state distribution chart
- [x] Build upcoming cards panel
- [x] Build SM-2 explanation and rating guide sidebar
- [x] Show SRS due count badge in sidebar navigation (auto-refreshes every 60s)
- [x] Write SM-2 algorithm unit tests (46 tests covering all SM-2 edge cases)
- [x] All 70 tests passing (46 SM-2 + 23 scoring + 1 auth)

## Phase 4 — Speaking Section Enhancements (COMPLETED)
- [x] Preparation countdown timer (per task type: Read Aloud=40s, Repeat Sentence=0s, Describe Image=25s, Re-tell Lecture=10s, Answer Short Question=3s)
- [x] Recording phase timer (per task type: Read Aloud=40s, Repeat Sentence=15s, Describe Image=40s, Re-tell Lecture=40s, Answer Short Question=10s)
- [x] Visual prep phase UI: animated SVG circular countdown, teal gradient, task-specific tips, auto-transitions to recording
- [x] Real-time transcription display during recording (Web Speech API live transcript + Whisper final transcription)
- [x] Word-level pronunciation colour highlighting (green=correct, yellow=hesitation, red=mispronounced, blue=extra, grey=missing)
- [x] Pronunciation comparison: original text vs spoken text side by side
- [x] Colour legend with interactive tooltips on hover
- [x] Fluency metrics: WPM, pause count, accuracy %, omission % with colour-coded feedback
- [x] WPM guide (< 80 = too slow, 100–160 = ideal, > 200 = too fast)
- [x] Dedicated SpeakingTask component (client/src/components/SpeakingTask.tsx)
- [x] LCS-based word alignment algorithm for accurate original vs spoken comparison
- [x] Timing info banner showing prep and record durations before task starts
- [x] Server returns Whisper transcription in submit response for client-side word alignment
- [x] getResponseById helper added to db.ts
- [x] All 70 tests still passing, 0 TypeScript errors

## Phase 5 — Speaking UX Enhancements (COMPLETED)
- [x] Skip preparation time button (visible during prep countdown, immediately starts recording)
- [x] Real-time voice-reactive waveform using Web Audio API AnalyserNode (bar chart animates with microphone amplitude)
- [x] Waveform shows flat/idle state during prep, animates during recording, freezes on stop
- [x] Model audio playback using browser TTS (speechSynthesis) for all speaking tasks
- [x] "Hear Model Answer" button with play/pause/stop controls and speed adjustment (Slow/Normal/Fast)
- [x] Visible images for Describe Image tasks (imageUrl from question data)
- [x] Fallback placeholder for Describe Image when no imageUrl is set (animated bar chart placeholder)
- [x] Task image panel with expand/collapse toggle
- [x] Describe Image questions updated with Wikimedia Commons chart/graph images
- [x] 0 TypeScript errors, 70/70 tests passing

## Phase 6 — AI Training & Accuracy Improvements
- [ ] Read and extract full PTE scoring rubrics from ptescoreguide.pdf and pasted_content.txt
- [ ] Rebuild scoring.ts with task-specific system prompts using official PTE criteria
- [ ] Add few-shot calibration examples (anchor responses at 10, 30, 50, 65, 79, 90 score levels)
- [ ] Add chain-of-thought reasoning: AI explains each criterion before assigning score
- [ ] Add structured JSON output schema with strict validation for all scoring tasks
- [ ] Add score confidence field and flag low-confidence responses for human review
- [ ] Rebuild aiCoach.ts with PTE-aligned diagnostic categories and actionable tips
- [ ] Add task-specific coaching prompts: Read Aloud, Repeat Sentence, Describe Image, Essay, SWT
- [ ] Add error pattern recognition: common PTE mistakes per task type
- [ ] Add model answer generation with quality tiers (band 65, band 79, band 90)
- [ ] Add pronunciation phoneme analysis prompt for speaking tasks
- [ ] Add grammar error classification (subject-verb agreement, tense, articles, prepositions)
- [ ] Add vocabulary sophistication scoring (academic word list, collocations, range)
- [ ] Add written discourse coherence scoring (cohesive devices, paragraph structure)
- [ ] Write AI scoring accuracy tests with known-score reference responses
- [ ] Add score normalization calibration table aligned to PTE 10-90 scale

## Phase 7 — System Audit, Concurrency & Premium Animations
- [ ] Audit all DB queries for user-scoped WHERE clauses (no data leakage between users)
- [ ] Audit session creation/management for per-user isolation
- [ ] Audit SRS cards for per-user isolation
- [ ] Audit audio upload endpoint for per-user file namespacing
- [ ] Fix any shared mutable state in server-side code
- [ ] Add framer-motion page transitions (fade+slide between routes)
- [ ] Add staggered list animations on Practice page task cards
- [ ] Add animated score counter on Dashboard and ScoreReport
- [ ] Add premium waveform animation in SpeakingTask
- [ ] Add skeleton loading states for all data-fetching components
- [ ] Add hover micro-interactions on all cards and buttons
- [ ] Add smooth accordion animations on AIFeedbackPanel
- [ ] Add animated progress bars with spring physics
- [ ] Add confetti/celebration animation on high scores
- [ ] Add smooth sidebar navigation highlight transitions
- [ ] Lazy load heavy pages (Analytics, MockTest, RevisionMode)

## Phase 8 — Practice Page Fix & Pearson Resources (COMPLETED)
- [x] Fix "Practice Now" button redirect (links to /practice/:section for logged-in users, login page for guests)
- [x] Practice page: questions hidden inside collapsible task type cards (accordion, collapsed by default)
- [x] Show question list only when specific task type card is expanded/clicked
- [x] Downloaded Pearson PTE Research Offline Practice Test (Jan 2024) — 1.8MB PDF
- [x] Extracted official passages, transcripts, sample answers from Pearson PDF
- [x] Created dedicated Resources page (/resources) with official Pearson materials
- [x] Added Resources to sidebar navigation (PTELayout)
- [x] Added Resources route to App.tsx
- [x] Official sample passages: Read Aloud, Repeat Sentence, Summarize Written Text, Write Essay, Fill in Blanks (Umami), Re-order Paragraphs, Summarize Spoken Text, Write from Dictation
- [x] PTE Score Bands reference table (10-90 scale, CEFR levels)
- [x] Links to all 4 official free Pearson resources (PDF + web)
- [x] Repeat Sentence TTS auto-play component added to PracticeSession
- [x] All 71 tests passing, 0 TypeScript errors

## Phase 9 — Section-Specific AI Scoring Engines (COMPLETED)
- [x] Research official PTE Academic Score Guide v21 (Nov 2024) — downloaded and extracted
- [x] Collected native speaker reference responses at B1, B2, C1, C2 CEFR levels
- [x] Built Speaking AI engine (server/ai/speakingAI.ts) with task-specific rubrics
  - [x] Read Aloud: Pronunciation (0-5) + Oral Fluency (0-5) + Content (0-5)
  - [x] Repeat Sentence: Pronunciation (0-5) + Oral Fluency (0-5) + Content (0-5)
  - [x] Describe Image: Pronunciation (0-5) + Oral Fluency (0-5) + Content (0-5)
  - [x] Re-tell Lecture: Pronunciation (0-5) + Oral Fluency (0-5) + Content (0-5)
  - [x] Answer Short Question: vocabulary knowledge, accuracy
  - [x] Multi-level calibration anchors (B1/B2/C1/C2) with native speaker examples
  - [x] Word-level pronunciation feedback with IPA notation
- [x] Built Writing AI engine (server/ai/writingAI.ts) with task-specific rubrics
  - [x] Summarize Written Text: Content 2, Form 2, Grammar 2, Vocabulary 2, Spelling 2 = 10 pts
  - [x] Write Essay: Content 3, Form 2, Grammar 2, Vocabulary 2, Spelling 1, Development 2, Linguistic Range 2, Coherence 2, Discourse 2 = 18 pts
  - [x] Multi-level calibration anchors with model answers at B1, B2, C1, C2
- [x] Built Reading AI engine (server/ai/readingAI.ts) with explanation engine
  - [x] Objective scoring for all 8 reading task types
  - [x] AI-generated explanations for correct/incorrect answers
  - [x] Distractor analysis for MCQ tasks
- [x] Built Listening AI engine (server/ai/listeningAI.ts) with transcription scoring
  - [x] Write from Dictation: deterministic word-by-word matching (overrides LLM)
  - [x] Summarize Spoken Text: 5 traits (Content, Form, Grammar, Vocabulary, Spelling)
  - [x] Highlight Correct Summary: correct/incorrect with explanation
  - [x] Fill in Blanks: partial credit per correct word
- [x] Created AI Scoring Router (server/routers/aiScoringRouter.ts) with 5 tRPC procedures
- [x] Registered aiScoringRouter in main routers.ts
- [x] Updated TaskResult interface with enhanced fields (cefrLevel, traits, strategyTips, modelAnswer)
- [x] Added TraitBar component for visual score breakdown with colour-coded bars
- [x] Enhanced ScoreDisplay: trait bars, CEFR badge, strategy tips, model answer, vocabulary feedback
- [x] Added AI scoring loading indicator ("Analysing with section-specific AI engine...")
- [x] AI scoring triggered automatically after submit (non-blocking, merges into result)
- [x] 13 calibration tests in server/ai/aiEngines.test.ts
- [x] All 84 tests passing, 0 TypeScript errors

## Phase 10 — High-Accuracy AI Engine Rebuild (COMPLETED)
- [x] Researched official PTE Academic Score Guide v21 (Nov 2024) + PTE Scoring Info for Partners (2024)
- [x] Rebuilt Speaking AI engine with chain-of-thought, deterministic pre-processing, 6-level calibration, phoneme analysis, IPA notation
- [x] Rebuilt Writing AI engine with criterion-by-criterion reasoning, deterministic Form/Spelling overrides, 6-level model answer tiers
- [x] Rebuilt Reading AI engine with passage-grounded explanations, distractor classification, adjacent pair scoring for Reorder Paragraphs
- [x] Rebuilt Listening AI engine with Levenshtein error classification (spelling/hearing/missing), phonetic confusion analysis, deterministic SST trait overrides
- [x] Fixed test isolation: vi.clearAllMocks() → vi.resetAllMocks() in all beforeEach blocks
- [x] All 84 tests passing, 0 TypeScript errors

## Phase 11 — Bug Fixes (Practice Page Errors) (COMPLETED)
- [x] Fix limit validation: increased max from 50 to 200 in questions.list procedure
- [x] Fix analytics.todayTarget: getTodayTarget now returns null instead of undefined
- [x] Verified getUserAnalytics and getUserMilestones already return null/[] (safe)
- [x] All 84 tests passing, 0 TypeScript errors

## Phase 12 — Speaking Section: Missing Task Types & Reorder (COMPLETED)
- [x] Research official PTE Speaking section order and rubrics for Respond to a Situation and Summarize Group Discussion
- [x] Add respond_to_situation and summarize_group_discussion to task types (handled via varchar taskType; no enum migration needed)
- [x] Run DB migration for new task types (N/A — varchar taskType requires no migration)
- [x] Seed 10+ questions for Respond to a Situation (12 seeded)
- [x] Seed 10+ questions for Summarize Group Discussion (10 seeded)
- [x] Expand existing speaking questions (Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question)
- [x] Build UI component for Respond to a Situation (situation prompt + 30s prep + 40s response)
- [x] Build UI component for Summarize Group Discussion (audio/transcript + 10s prep + 90s response)
- [x] Add AI scoring for Respond to a Situation (content relevance, fluency, pronunciation)
- [x] Add AI scoring for Summarize Group Discussion (content coverage, fluency, pronunciation)
- [x] Reorder speaking tasks in Practice page to match official PTE exam order
- [x] Update PTELayout sidebar to show correct speaking task order (N/A — sidebar links sections only, not individual tasks)
- [x] All tests passing, 0 TypeScript errors

## Phase 13 — Full Task Audit, Fix & AI Efficiency (IN PROGRESS)
- [x] Add SECTION_TASK_ORDER map to Practice.tsx for correct official PTE task ordering
- [x] Add summarize_group_discussion and respond_to_situation to taskTypeInfo in Practice.tsx
- [x] Update speaking section description to show 7 task types
- [x] Audit PracticeSession: verify all 20 task types render correctly
- [x] Fix any broken task rendering (missing UI, wrong component, wrong timer) (none found — all 20 render correctly)
- [x] Fix aiScoringRouter to handle new task types (respond_to_situation, summarize_group_discussion)
- [ ] Optimize AI engines: reduce prompt token count, keep accuracy
- [x] Add timeout/fallback: if AI takes >15s, return deterministic score
- [x] All tests passing, 0 TypeScript errors


## Phase 13 — Payment System & Admin Panel (IN PROGRESS — superseded by eSewa/Khalti below)
- [x] Set up payment integration (superseded: eSewa + Khalti via server/payment/* instead of Stripe)
- [x] Create subscriptions table (id, userId, gatewaySubscriptionId, planId, status, currentPeriodStart, currentPeriodEnd, createdAt, canceledAt)
- [x] Create payments table (id, userId, paymentIntentId, amount, currency, status, description, createdAt)
- [x] Create subscription_plans table (id, name, price, interval, features, maxSessions, storageGB, createdAt)
- [x] Add subscription status to users table (subscription_id, plan_tier: free/pro/premium)
- [x] Build webhook handler for payment success/failure/subscription updates (eSewa + Khalti)
- [x] Create admin panel layout with sidebar navigation (Dashboard, Users, Analytics, Billing, Settings)
- [x] Build admin dashboard with KPI cards (total users, active subscriptions, revenue, storage used)
- [x] Build users management table (list, search, filter by plan, view details, suspend/activate)
- [x] Build analytics dashboard (user growth chart, session trends, revenue trends, task type popularity)
- [x] Build billing dashboard (subscription list, payment history, revenue breakdown by plan)
- [x] Implement adminProcedure for role-based access control
- [x] Add admin check middleware to all admin routes
- [x] Create pricing page with subscription plans
- [ ] Add subscription checkout flow (eSewa/Khalti hosted checkout — verify live integration)
- [ ] Add subscription management page (view current plan, upgrade/downgrade, cancel)
- [ ] Write admin panel integration tests
- [x] All tests passing, 0 TypeScript errors


## Phase 13 — Payment System & Admin Panel (IN PROGRESS)
- [x] Create payment database schema (subscriptions, subscription_plans, payments tables)
- [x] Run database migration for payment tables
- [x] Implement eSewa payment gateway integration (server/payment/esewa.ts)
- [x] Implement Khalti payment gateway integration (server/payment/khalti.ts)
- [x] Create payment database helpers (server/payment/db.ts)
- [x] Create payment tRPC router (server/routers/paymentRouter.ts)
- [x] Add payment router to main appRouter
- [x] Build admin dashboard page (client/src/pages/AdminDashboard.tsx)
- [x] Add admin route to App.tsx (/admin)
- [x] Admin dashboard KPI cards: Total Users, Active Subscriptions, Total Revenue, Storage Used
- [x] Admin dashboard tabs: Overview, Users, Billing, Analytics, Settings
- [x] Revenue by gateway breakdown chart
- [x] Subscriptions by plan breakdown
- [x] Recent payments transaction list
- [x] Admin role-based access control (redirect non-admins to home)
- [x] All 84 tests passing, 0 TypeScript errors
- [x] Create webhook handlers for eSewa and Khalti payment confirmations
- [x] Create user payment history page with transaction list and subscription details
- [x] Create admin user management UI with search, filter, bulk actions
- [x] Create admin analytics dashboard with DAU, MAU, churn rate, LTV metrics
- [x] Integrate AdminUserManagement component into admin panel
- [x] Integrate AdminAnalytics component into admin panel
- [x] Add PaymentHistory route to App.tsx
- [x] Create email service with payment receipt, renewal reminder, welcome, and cancellation emails
- [x] Create public pricing page with plan comparison and FAQ
- [x] Add Pricing route to App.tsx
- [x] Implement email notification helpers for payment and subscription events
- [ ] Implement admin procedures for user management (ban, promote, view details) (ban = toggleUserBan done; promote/view missing)
- [x] Implement admin procedures for analytics queries
- [ ] Implement subscription auto-renewal background job (no scheduler exists — email reminders only)
- [ ] Add subscription management page for users
- [ ] Create subscription plan management UI for admins


## Phase 16 — System Control Admin Panel

- [x] Create system health monitoring dashboard (CPU, memory, database, API health)
- [x] Build advanced user management (search, filter, ban, promote, view activity)
- [x] Create content and question management system (upload, edit, delete questions)
- [x] Build system configuration and settings panel (email, payment, features)
- [x] Implement admin procedures for system control operations (systemAdminRouter)
- [x] Add audit logging and activity tracking for admin actions
- [x] Create admin-only system statistics and reports
- [x] Implement role-based permissions for different admin levels
- [x] Add system backup and recovery controls
- [x] Create API key management for integrations
- [x] Create SystemAdminPanel page with 6 tabs (Health, Users, Content, Settings, Logs, Security)
- [x] Add /system-admin route to App.tsx


## Phase 17 — Real Database Integration for Admin Panel

- [x] Create adminDb.ts with database query helpers
- [x] Implement getSystemStatistics() to fetch real user, session, and revenue data
- [x] Implement getAdminUsers() to fetch admin accounts from database
- [x] Implement getPlatformUsers() with pagination for user management
- [x] Implement getUserSubscriptions() to fetch subscription data
- [x] Implement getPaymentTransactions() to fetch payment history
- [x] Implement getRevenueByGateway() for payment analytics
- [x] Implement getUserActivityLogs() for activity tracking
- [x] Update systemAdminRouter to use real database queries instead of mock data
- [x] Update SystemAdminPanel UI to fetch and display real data from backend
- [x] Add empty state handling when no data exists
- [x] Add loading states and error handling in UI


## Phase 18 — Final Enhancements Complete

- [x] Updated SystemAdminPanel UI to fetch real data from backend procedures
- [x] Added loading skeletons for all data sections
- [x] Implemented empty state handling for no data scenarios
- [x] Created system statistics KPI cards (Users, Subscriptions, Revenue, Failed Payments)
- [x] Built 6-tab admin interface (Health, Users, Content, Settings, Logs, Alerts)
- [x] Integrated real-time alerts dashboard with severity levels (error, warning, info)
- [x] Added user search functionality with query input
- [x] Implemented activity logs with timestamp and status tracking
- [x] Added service status monitoring with uptime tracking
- [x] All 84 tests passing, zero TypeScript errors


## Phase 19 — Comprehensive Analytics Dashboard

- [ ] Create database queries for user engagement metrics (DAU, MAU, WAU, login patterns)
- [ ] Create database queries for learning performance metrics (avg scores, improvement trends, weak areas)
- [ ] Create database queries for payment/revenue metrics (MRR, ARR, subscription breakdown, CLV)
- [ ] Create database queries for system health metrics (uptime, error rates, API response times)
- [ ] Build admin procedures for analytics data retrieval
- [ ] Create comprehensive analytics dashboard UI with all metric sections
- [ ] Add line charts for engagement trends and revenue over time
- [ ] Add bar charts for score distribution and task type performance
- [ ] Add pie charts for subscription breakdown and payment method distribution
- [ ] Implement date range filtering (7 days, 30 days, 90 days, custom)
- [ ] Add CSV/PDF export functionality for reports
- [ ] Test all analytics features end-to-end
