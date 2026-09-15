# Client Internals

All paths relative to repo root. Client TS lives in `client/` (104 TS/TSX
files). Build: Vite. Entry HTML: `client/index.html`.

## Entry & Bootstrap

- **`client/index.html`** — HTML entry, title, Inter font (300–800),
  `<div id="root">`, module script `/src/main.tsx`.
- **`client/vite.config.ts`** — plugins: `@vitejs/plugin-react`,
  `@tailwindcss/vite`, `@builder.io/vite-plugin-jsx-loc`; aliases `@` →
  `client/src`, `@shared` → `shared/`, `@assets` → `attached_assets`;
  `root: client`, `envDir` = repo root, `outDir: dist/public`.
- **`client/src/main.tsx`** — creates `QueryClient`; tRPC client via
  `httpBatchLink` → `/api/trpc`, superjson, `credentials: "include"`.
  Subscribes to React Query caches; on error message === `UNAUTHED_ERR_MSG`
  forces redirect to `/login`. Renders `trpc.Provider` →
  `QueryClientProvider` → `<App/>`.
- **`client/src/const.ts`** — re-exports `COOKIE_NAME`, `ONE_YEAR_MS`;
  `getLoginUrl = () => "/login"`.
- **`client/src/lib/trpc.ts`** — `createTRPCReact<AppRouter>()`.
- **`client/src/lib/supabase.ts`** — Supabase browser client
  (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`).
- **`client/src/lib/utils.ts`** — `cn()` (clsx + tailwind-merge).
- **`client/src/lib/animations.ts`** — framer-motion presets (`springs`,
  `pageVariants`, `fadeIn`, `slideUp`, `staggerContainer`, `cardHover`,
  `buttonPress`, `scoreReveal`, `progressFill`, `confettiParticle`,
  `waveformBar`, `tabUnderline`, `modalVariants`, ...).

## Routing (`client/src/App.tsx`)

Providers: `ErrorBoundary` → `ThemeProvider` (default light) →
`TooltipProvider` → `Toaster` (sonner). `Suspense` + `PageLoader`.
Eager pages: Home/Login/AuthCallback; everything else lazy.

### wouter route table

| Route | Page |
|---|---|
| `/` | Home |
| `/login` | Login |
| `/auth/callback` | AuthCallback |
| `/dashboard` | Dashboard |
| `/admin` | AdminDashboard (redirect hub) |
| `/admin/dashboard` | AdminDashboardPage |
| `/admin/users` | AdminUsersPage |
| `/admin/payments` | AdminPaymentsPage |
| `/payments` | PaymentHistory |
| `/pricing` | Pricing |
| `/system-admin` | SystemAdminPanel |
| `/practice` + `/practice/:section` | Practice |
| `/session/:sessionId` | PracticeSession |
| `/mock-test` | MockTest |
| `/score-report/:sessionId` | ScoreReport |
| `/analytics` | Analytics |
| `/learning-modes` | LearningModes |
| `/profile` | Profile |
| `/coaching-plan` | CoachingPlan |
| `/revision` | RevisionMode |
| `/resources` | Resources |
| `/404` + catch-all | NotFound |

> `/admin/analytics` and `/admin/settings` appear in AdminLayout menu but have
> **no route** (404).

## Context & Hooks

- `src/contexts/ThemeContext.tsx` — `ThemeProvider` (persists `"theme"` in
  localStorage, toggles `.dark` class), `useTheme()`.
- `src/_core/hooks/useAuth.ts` — `useAuth({ redirectOnUnauthenticated?,
  redirectPath? })`. Uses `trpc.auth.me` (retry:false) + `trpc.auth.logout`.
  Returns `{ user, loading, error, isAuthenticated, refresh, logout }`;
  mirrors user to `localStorage["pte-user-info"]`; redirects via
  `window.location.href`.
- `src/hooks/usePersistFn.ts` — stable function reference.
- `src/hooks/useMobile.tsx` — `useIsMobile()` (768px breakpoint).
- `src/hooks/useComposition.ts` — IME composition guard for inputs/textareas.

## App Components (`src/components/`)

| Component | Notes |
|---|---|
| `PTELayout` | Main authed shell — sidebar (lucide), mobile drawer, header. Nav: Dashboard/Practice/Mock Test/Revision (⚡ SRS badge, polls `trpc.srs.getStats` every 60s)/AI Coaching Plan/Learning Modes/Analytics/Resources/Profile + Quick Practice section links. Own logout mutation → `/`. |
| `DashboardLayout` | shadcn `SidebarProvider` shell, resizable sidebar (drag, width 200–480 persisted to localStorage `sidebar-width`), mobile top bar. Gate: skeleton / Sign-in screen. Demo menu only. |
| `AdminLayout` | Admin dark-slate shell, collapsible. Menu: `/admin/dashboard`, `/admin/users`, `/admin/payments`, `/admin/analytics`, `/admin/settings`. |
| `SpeakingTask` | Core speaking UI. `SPEAKING_TIMINGS` per task. Prep countdown (`CircularTimer`) + skip button → `MediaRecorder` (webm/opus) → Web Audio `AnalyserNode` live waveform → Web Speech API live transcript → stop → playback review → post-submit LCS word alignment (`alignWords`, 5 status classes) → `FluencyMetrics` (WPM/pauses/accuracy/omissions) → model `speechSynthesis` TTS player (rate 0.7/0.9/1.1). |
| `AIChatBox` | Reusable chat UI (types `Message`, `AIChatBoxProps`, server-aligned `system|user|assistant`). Streamdown markdown, auto-scroll, suggested prompts. |
| `AIFeedbackPanel` | Post-submit feedback. `trpc.aiCoach.getTaskFeedback` mutation. Overall band, estimated score range, score breakdown bars, specific errors, priority tips, model answers 65/79/90, next steps. |
| `AdminAnalytics` | Mock-data analytics (old), recharts charts, NRP metrics. |
| `AdminAnalyticsReal` | Live analytics. Day-range 7/30/90; queries `systemAdmin.{getUserEngagement, getLearningPerformance, getPaymentRevenue, getChurnRetention, getCustomerLTV}`. DAU line, login frequency, score pie, scores-per-task bar, weak areas, revenue pie + line, subscription breakdown, LTV + top-10. |
| `AdminUserManagement` | User table (mock fallback), search/filter/sort/bulk, `onUserAction`, pagination stub. |
| `AnimatedCounter` | In-view rAF count-up. |
| `ScoreRing` | Animated SVG ring on 10–90 scale. |
| `AnimatedProgressBar` / `SkillBar` / `CircularProgress` | Score bars color-coded by band (≥79/≥65/≥50). |
| `ConfettiCelebration` / `ScoreBadge` | 60-particle confetti + pop-in score chip (2.5 s). |
| `SkeletonLoader` | `DashboardSkeleton`, `PracticeCardSkeleton`, `ScoreReportSkeleton`, `QuestionListSkeleton`, `FeedbackSkeleton`. |
| `DashboardLayoutSkeleton` | Sidebar + content skeleton. |
| `ErrorBoundary` | Class boundary, stack trace panel + Reload. |
| `Map` | `MapView` — Google Maps JS via forge proxy (`VITE_FRONTEND_FORGE_API_URL`) with `VITE_FRONTEND_FORGE_API_KEY`. |

## shadcn/ui registry (`src/components/ui/`, 53 files)

Standard Radix-based primitives: accordion, alert, alert-dialog, aspect-ratio,
avatar, badge, breadcrumb, calendar (react-day-picker), card, carousel
(embla), chart (recharts helpers), checkbox, collapsible, command (cmdk),
context-menu, dialog, drawer (vaul), dropdown-menu, form (react-hook-form +
zod), hover-card, input, input-otp, label, menubar, navigation-menu,
pagination, popover, progress, radio-group, resizable
(react-resizable-panels), scroll-area, select, separator, sheet, skeleton,
slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip,
sidebar — plus custom additions: `button-group`, `input-group`, `field`,
`empty`, `item`, `kbd`, `spinner`.

## Pages (`src/pages/`, 23)

| Page | Route | Behavior / tRPC |
|---|---|---|
| Home | `/` | Marketing landing, CTAs. |
| Login | `/login` | Supabase Google OAuth + email OTP (`signInWithOtp`); posts access_token to `/api/auth/session`; → `/dashboard`. |
| AuthCallback | `/auth/callback` | Reads access_token/refresh_token from hash, posts session, → `/dashboard` or `/login`. |
| Dashboard | `/dashboard` | `analytics.myStats`, `todayTarget`, `milestones`, `sessions.myHistory({limit:5})`, `analytics.generateTarget({targetMinutes:30})`. Stat cards, target progress, recent sessions, milestones. |
| Practice | `/practice(/:section)` | Section tabs, mode filter, task-type accordions. `questions.list({section,limit:100})`, `sessions.create({sessionType:"section_practice",...})` → `/session/{id}?questionId=&taskType=&mode=`. |
| PracticeSession | `/session/:sessionId` | Session runner. `questions.getById`, `sessions.complete`, `responses.submit`, then `aiScoring.scoreSpeak/Write/Read/Listen` mutations. Speaking → `SpeakingTask`. Shows `AIFeedbackPanel`. |
| MockTest | `/mock-test` | Plan picker → `sessions.create({sessionType:"mock_test",...})` → session. |
| ScoreReport | `/score-report/:sessionId` | `sessions.getReport`. Overall ScoreRing, skill bars, per-answer breakdown, band badges, confetti on high scores. |
| Analytics | `/analytics` | `analytics.myStats`, `sessions.myHistory({limit:20})`, `analytics.milestones`. Trend charts, skill bars, daily target. |
| LearningModes | `/learning-modes` | beginner/exam/diagnostic/revision cards → session creation. |
| Profile | `/profile` | `analytics.myStats`, `profile.update`, `analytics.generateTarget`. Editable level/goal/target/notifications. |
| CoachingPlan | `/coaching-plan` | `aiCoach.getCoachingPlan` mutation → 7-day/90-day plan, focus areas, estimated band. |
| RevisionMode | `/revision` | SRS UI. `srs.getStats`, `getDueCards({limit:20})`, `recordReview`, `getUpcomingCards({limit:8})`. Card flip, ratings Again/Hard/Good/Easy. |
| Resources | `/resources` | Static Pearson resource library. |
| Pricing | `/pricing` | Free/Pro/Premium tiers (NPR), comparison, CTA → `/login`. |
| PaymentHistory | `/payments` | Payment list + active subscription UI. tRPC calls commented out. |
| NotFound | `/404` + catch-all | 404 + "Go home". |
| AdminDashboard | `/admin` | Redirect hub by role. |
| AdminDashboardPage | `/admin/dashboard` | `systemAdmin.getSystemStats`, `getSystemHealth`. |
| AdminUsersPage | `/admin/users` | `systemAdmin.getActivityLogs({limit:100})` + AdminUserManagement. |
| AdminPaymentsPage | `/admin/payments` | `systemAdmin.getActivityLogs({limit:200})`. |
| SystemAdminPanel | `/system-admin` | 6-tab system panel: Health, Users, Content, Settings, Logs, Alerts. `getSystemStats`, `getSystemHealth`, `getActivityLogs`, `getSystemAlerts`, `getPerformanceMetrics`. |
| ComponentShowcase | (no route) | shadcn/ui demo page + AIChatBox demo. |

## Theming (`src/index.css`)

Tailwind v4 (`@import "tailwindcss"` + `tw-animate-css`), `@theme inline`
tokens, oklch light/dark palettes, APEUni-inspired teal primary + dark
sidebar. Keyframes: `recording-pulse`, `waveform`, `fadeIn`. Custom classes:
`.task-badge-{ra,rs,di,rl,asq,swt,we,mcs,mcm,ro,fibr,fibrw,sst,mcsl,fibl,hcs,
smw,hiw,wfd}`, word-highlight statuses, record button, score bars, section
tabs.

## Speaking Implementation Details

- **Prep timers** — `SPEAKING_TIMINGS` default prep/record seconds:
  read_aloud 40/40 · repeat_sentence 0/15 · describe_image 25/40 ·
  retell_lecture 10/40 · answer_short_question 3/10 ·
  summarize_group_discussion 10/90 · respond_to_situation 10/40.
- **Recording** — `MediaRecorder` webm/opus; blob pushed via FormData to
  `POST /api/upload-audio`.
- **Waveform** — Web Audio `AnalyserNode` drives animated bars; flat during
  prep, animating during record, frozen on stop.
- **Word alignment** — LCS-based `alignWords(original, spoken)` produces
  per-word statuses (green=correct, yellow=hesitation, red=mispronounced,
  blue=extra, grey=missing).
- **Live transcript** — Web Speech API during recording; server Whisper
  transcription replaces it after submit.
- **Model audio** — browser `speechSynthesis` with speed presets.