# Features

Feature inventory by phase (from the project's `todo.md`). Status legend:
✅ done · ⬜ pending/not started.

## Phase 1 — Core Platform ✅

- **Database & backend**: extended schema (practice_sessions, questions,
  user_responses, scores, skill_scores, notifications); question-bank seeding
  for all task types; tRPC routers (questions, sessions, scoring, analytics,
  notifications); LLM scoring for writing (essay, SWT) and speaking (read
  aloud, repeat sentence, describe image); audio transcription; score
  normalization (10–90); progress tracking + analytics; audio upload endpoint;
  partial credit scoring (WFD, reorder, highlight incorrect words).
- **Frontend**: global design system; landing/home page; dashboard sidebar
  layout; auth flow; profile page.
- **Practice modules**: all 20 task types across speaking/writing/reading/
  listening; audio recording with waveform; countdown timer.
- **Score & feedback**: score report (overall + communicative + enabling
  skills); diagnostic feedback; action plan; task-specific tips.
- **Analytics & progress**: dashboard charts, score trends, skill radar,
  performance history.
- **Modes**: full mock test, section practice, Beginner (guided + templates),
  Exam (strict timed), Diagnostic (weakness detection), Revision
  (high-impact), daily targets, reminders/milestones.

## Phase 2 — APEUni Redesign & AI Coaching ✅

- Teal/cyan APEUni color scheme, dark sidebar, PTEMaster branding.
- `aiCoach.ts` AI coaching engine with task-specific feedback.
- Coaching plan router (`getTaskFeedback`, `getCoachingPlan`).
- `AIFeedbackPanel` (criterion scoring, error analysis, tips, model answers).
- `CoachingPlan` page (4-week roadmap, skill gap analysis, daily schedule).
- Question bank expanded to 127+ (`expand-questions.mjs`).

## Phase 3 — Spaced Repetition (SM-2) ✅

- `spaced_repetition_cards` + `srs_review_logs` tables; SM-2 in `server/sm2.ts`
  (46 unit tests).
- SRS router (`getDueCards`, `recordReview`, `getStats`, `resetCard`,
  `addCard`, `autoCreateFromSession`).
- Auto-creation when score < 65 threshold.
- `RevisionMode` page: card flip, difficulty 1–5, keyboard shortcuts.
- Stats panel (due today, reviewed today, total, retention), 14-day review
  heatmap, deck composition chart, upcoming cards, SM-2 explanation sidebar,
  due-count badge polling every 60 s.

## Phase 4 — Speaking Enhancements ✅

- Per-task preparation countdown (Read Aloud 40 s, Repeat Sentence 0 s,
  Describe Image 25 s, Re-tell Lecture 10 s, ASQ 3 s) with animated SVG
  circular timer + task tips + auto-transition.
- Recording-phase timers; real-time transcription (Web Speech live + Whisper
  final); word-level pronunciation color highlighting (green/red/blue/grey);
  side-by-side original vs spoken comparison; color legend tooltips; fluency
  metrics (WPM, pause count, accuracy %, omission %); WPM guide
  (<80 slow, 100–160 ideal, >200 fast); dedicated `SpeakingTask` component;
  LCS word alignment; timing info banner; Whisper transcription returned to
  client.

## Phase 5 — Speaking UX ✅

- Skip-prep button; voice-reactive waveform (Web Audio AnalyserNode, animate
  on record / freeze on stop); model audio via browser TTS with
  play/pause/stop + Slow/Normal/Fast; visible images on Describe Image with
  fallback placeholder; task image expand/collapse panel; Wikimedia Commons
  chart images.

## Phase 6 — AI Training & Accuracy ⬜ (pending backlog)

- Rubric extraction from guide PDFs, task-specific system prompts, few-shot
  calibration, chain-of-thought, strict JSON output, confidence fields, task-
  specific coaching prompts, error pattern recognition, quality-tier model
  answers, phoneme analysis, grammar classification, vocabulary scoring,
  discourse scoring, calibration tests, normalization table.

## Phase 7 — System Audit, Concurrency & Premium Animations ⬜ (pending)

- DB user-scoping audit, per-user isolation, audio file namespacing, shared
  mutable state audit, framer-motion page transitions, staggered list
  animations, animated counters, premium waveform, skeletons, hover
  micro-interactions, accordion animations, spring progress bars, confetti,
  sidebar highlight transitions, lazy loading.

## Phase 8 — Practice Page Fix & Pearson Resources ✅

- "Practice Now" redirect fix; collapsible question cards (collapsed by
  default); Pearson PTE Research Offline Practice Test (Jan 2024) extraction;
  `/resources` page with official materials; PTE score band reference table
  (10–90, CEFR); links to 4 official Pearson resources; Repeat Sentence TTS
  auto-play in PracticeSession.

## Phase 9 — Section-Specific AI Scoring Engines ✅

- Official PTE Academic Score Guide v21 (Nov 2024) grounding; native-speaker
  reference responses at B1/B2/C1/C2.
- **Speaking** (`speakingAI.ts`): Read Aloud, Repeat Sentence, Describe Image,
  Re-tell Lecture (Pronunciation 0–5 + Oral Fluency 0–5 + Content 0–5),
  Answer Short Question (knowledge/accuracy); multi-level calibration anchors;
  word-level pronunciation feedback with IPA.
- **Writing** (`writingAI.ts`): SWT (Content 2, Form 2, Grammar 2, Vocabulary
  2, Spelling 2 = 10), Essay (Content 3, Form 2, Grammar 2, Vocabulary 2,
  Spelling 1, Development 2, Linguistic Range 2, Coherence 2, Discourse 2 =
  18); multi-level model answers.
- **Reading** (`readingAI.ts`): objective scoring for all 8 types + AI
  explanations + distractor analysis.
- **Listening** (`listeningAI.ts`): WFD deterministic word matching (overrides
  LLM), SST 5 traits, Highlight Correct Summary, Fill in Blanks partial credit.
- `aiScoringRouter` (5 procedures); `TraitBar` visual; enhanced `ScoreDisplay`;
  non-blocking AI scoring after submit; 13 calibration tests.

## Phase 10 — High-Accuracy AI Engine Rebuild ✅

- Rebuilt Speaking/Writing/Reading/Listening engines: chain-of-thought,
  deterministic pre-processing, 6-level calibration (speaking), deterministic
  Form/Spelling overrides (writing), Levenshtein error classification +
  phonetic confusion (listening), adjacent-pair scoring (reorder), test
  isolation via `vi.resetAllMocks()`.

## Phase 11 — Bug Fixes ✅

- `questions.list` limit max 50 → 200; `analytics.todayTarget` null instead of
  undefined; verified `getUserAnalytics`/`getUserMilestones` null/[] safe.

## Phase 12 — Speaking: Missing Task Types & Reorder ⬜ (pending)

- Respond to a Situation and Summarize Group Discussion research, schema
  enum additions, migrations, seeding, UI components, AI scoring, official
  task ordering.

## Phase 13 — Task Audit, Fix & AI Efficiency ⬜ (in progress)

- `SECTION_TASK_ORDER`, taskTypeInfo entries for new types, speaking section
  description (7 types), audit all 20 task renderings, aiScoringRouter new
  types, prompt token optimization, 15 s timeout fallback.

## Phase 13 (second block) — Payment System & Admin Panel 🔶 partially done

- **Done**: payment schema (subscriptions, subscription_plans, payments);
  eSewa integration (`server/payment/esewa.ts`); Khalti integration
  (`payment/khalti.ts`); payment DB helpers; payment router; admin dashboard
  page (`AdminDashboard.tsx`) with KPI cards (Total Users, Active Subs, Total
  Revenue, Storage Used) and tabs (Overview/Users/Billing/Analytics/Settings);
  revenue-by-gateway chart; subscriptions-by-plan breakdown; recent payments
  list; admin role-based redirect; webhook handlers (eSewa/Khalti); payment
  history page; admin user management (search/filter/bulk); admin analytics
  (DAU/MAU/churn/LTV); email service (receipt, renewal, welcome,
  cancellation); public pricing page.
- **Pending**: admin user management procedures (ban/promote/view),
  analytics procedures, auto-renewal background job, subscription management
  page, plan management UI.

## Phase 16 — System Control Admin Panel ✅

- System health dashboard (CPU, memory, DB, API); advanced user management;
  content/question management UI; configuration/settings panel; admin
  procedures (`systemAdminRouter`); audit logging; system statistics/reports;
  role-based permissions; backup/recovery controls; API key management;
  `SystemAdminPanel` page (Health, Users, Content, Settings, Logs, Security);
  `/system-admin` route.

## Phase 17 — Real Database Integration for Admin Panel ✅

- `adminDb.ts` query helpers; `getSystemStatistics`, `getAdminUsers`,
  `getPlatformUsers`, `getUserSubscriptions`, `getPaymentTransactions`,
  `getRevenueByGateway`, `getUserActivityLogs`; systemAdminRouter switched to
  real queries (UI wiring + loading/empty states in Phase 18).

## Phase 18 — Final Enhancements ✅

- SystemAdminPanel fetches real data; loading skeletons; empty states; KPI
  cards (Users, Subscriptions, Revenue, Failed Payments); 6-tab interface;
  real-time alerts dashboard (error/warning/info severity); user search;
  activity logs with timestamps + status; service status monitoring.

## Phase 19 — Comprehensive Analytics Dashboard ⬜ (pending)

- DAU/MAU/login patterns, learning performance metrics, MRR/ARR/CLV, system
  health metrics, admin procedures, dashboard UI, line/bar/pie charts, date
  range filtering, CSV/PDF export, end-to-end tests.

## Test Coverage History

- Phase 1: 24 tests → Phase 3: 70 (SM-2) → Phase 8: 71 → Phase 9/10/11/18:
  84 tests, 0 TS errors.