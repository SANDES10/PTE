# Architecture

## System Overview

Monorepo-style single application. One TypeScript codebase serves both the
React client and the Node/Express server. The same Express app can run as a
persistent Node server (dev, `start`) or as a Vercel serverless function
(`api/index.ts` via `serverless-http`).

```
                    ┌─────────────────────────────────────────┐
   Browser          │  Express app (server/_core/app.ts)      │
   ┌──────┐   HTTP  │                                         │
   │ React│◄───────►│  /api/trpc  → tRPC appRouter            │
   │ (Vite│  JSON   │  /api/auth/*  → Supabase Auth session    │
   │  dev)│         │  /api/upload-audio  → Supabase Storage   │
   └──────┘         │  /api/oauth/callback  → legacy redirect  │
      │             │                                         │
      │  Supabase JS seemed                           │  OpenAI · Supabase · eSewa · Khalti
      └─────────────┘                                  │  (external services)
                                                       ▼
                                          PostgreSQL (Drizzle ORM)
```

## Layers

### 1. Client (`client/`) — React SPA
- Vite-built, served by Vite dev server (`server/_core/vite.ts`) or static
  build output (`dist/public`).
- tRPC client (`client/src/lib/trpc.ts`) with `httpBatchLink` → `/api/trpc`,
  superjson transformer, `credentials: "include"`.
- React Query for server-state caching; global 401 handler redirects to
  `/login`.

### 2. Transport layer — Express + tRPC
- `server/_core/app.ts` builds the Express app: JSON body parsing (10 MB
  limit), auth routes, audio upload route, and the tRPC middleware mount.
- tRPC routers in `server/routers.ts` + `server/routers/*`.
- Procedures gated by three tiers: `publicProcedure`,
  `protectedProcedure` (JWT session), `adminProcedure` (role check).

### 3. Server core (`server/_core/`)
- `sdk.ts` — JWT session service (issue/verify `app_session_id` cookie).
- `context.ts` — per-request tRPC context: authenticates via cookie → user.
- `env.ts` — single `ENV` object: every env var read at module load.
- `supabase.ts` — Supabase admin client + token verification.
- `llm.ts` — OpenAI chat-completions wrapper (`gpt-4o-mini`).
- `voiceTranscription.ts` — Whisper transcription wrapper.
- `vite.ts` — dev middleware / static SPA serving.

### 4. Business logic — routers, scoring, AI, SRS, payments, admin

### 5. Data layer — `server/db.ts` + `server/payment/db.ts` + `server/admin/*`
Drizzle ORM over PostgreSQL via `postgres` driver
(`getDb()` lazy singleton, `{prepare:false, max:1}`). Schema in
`drizzle/schema.ts`.

## Auth Flow

1. Client signs in via Supabase browser SDK (Google OAuth or email magic link).
2. `AuthCallback` / `Login` posts the `access_token` to `POST /api/auth/session`.
3. Server calls `verifySupabaseAccessToken` (Supabase `auth.getUser`).
4. `mapSupabaseUserToProfile` → `db.upsertUser` (auto-promotes to admin when
   `openId === OWNER_OPEN_ID`).
5. `sdk.createSessionToken(openId)` → signed JWT (HS256, `JWT_SECRET`, 1 year).
6. JWT stored in httpOnly cookie `app_session_id`
   (`{httpOnly, path:"/", sameSite:"lax", secure: https}`).
7. `createContext` verifies cookie on every tRPC request → `ctx.user`.

## Scoring Data Flow (per submitted response)

```
user submits response (responses.submit / aiScoring.*)
   │
   ├─ writing   → scoreWritingTask  (legacy LLM)  or  writingAI.scoreWritingTask
   ├─ speaking  → transcribeAudio (Whisper) → scoreSpeakingTask (legacy) or speakingAI
   ├─ reading   → scoreObjectiveTask (deterministic) or readingAI
   └─ listening → scoreObjectiveTask (deterministic) or listeningAI
   │
   ▼
normalizedScore on 10–90 scale persisted to userResponses
   │
   ├─ score < 65  → auto-create SRS card (spaced repetition)
   ├─ session complete → recompute skill averages → session overallScore
   └─ overall ≥ 65 → milestone created
```

## Session Lifecycle

1. `sessions.create` (practice/mock/diagnostic/revision/beginner) → active
   session row.
2. Client loads question (`questions.getById`), user answers
   (`responses.submit`, `aiScoring.*`).
3. `sessions.complete` recomputes averages, writes diagnostic feedback
   (weak/strong skills + action plan), creates milestone at ≥65.

## Two Scoring Stacks (important)

The legacy stack (`server/scoring.ts`) and the section AI engines
(`server/ai/*`) run in parallel:

| | Legacy `server/scoring.ts` | Section engines `server/ai/*` |
|---|---|---|
| Entry | `responses.submit` | `aiScoring.scoreSpeak/Write/Read/Listen` |
| Style | LLM few-shot calibration (band 90/65/42) + chain-of-thought | Deterministic pre-scoring + LLM trait computation |
| Determinism | Objective tasks only | All tasks (word counts, WER, Levenshtein, exact match) |
| Client use | initial submit | post-submit "analysing..." refinement |

Both persist to the same `userResponses` columns. Dispatcher mismatch risk:
`sesions.submit` vs `aiScoring` may invoke different engines for the same
question.

## Directory Layout

```
api/index.ts              Vercel serverless entry (serverless-http wrapper)
server/
  _core/                  trpc, context, env, sdk (JWT), supabase, cookies,
                          app.ts (Express), authRoutes, llm, voiceTranscription,
                          imageGeneration (unused), map (unused), dataApi (stub),
                          notification, systemRouter, vite, types
  routers.ts              root appRouter (12 routers)
  routers/                aiScoring, payment, systemAdmin
  ai/                     speakingAI, writingAI, readingAI, listeningAI (+tests)
  payment/                esewa, khalti, db (payment tables)
  webhooks/               paymentWebhook (NOT mounted / dead code)
  email/                  emailService (log-only stub, dead code)
  admin/                  adminAuth (dead), adminDb, analyticsDb
  scoring.ts              legacy scoring engine
  sm2.ts                  SM-2 spaced repetition engine
  db.ts                   DB access layer (main)
  storage.ts              Supabase storage helpers
  aiCoach.ts              AI coaching engine v2
  seed-*.mjs              MySQL seed scripts (legacy dialect)
client/
  index.html              HTML entry
  vite.config.ts
  src/                    main.tsx, App.tsx (routes), const.ts, index.css
  src/lib/                trpc, supabase, utils, animations
  src/contexts/           ThemeContext
  src/_core/hooks/        useAuth
  src/hooks/              usePersistFn, useMobile, useComposition
  src/components/         PTELayout, DashboardLayout, AdminLayout, SpeakingTask,
                          AIChatBox, AIFeedbackPanel, admin components, animation
                          components, skeletons, ErrorBoundary, Map
  src/components/ui/      53 shadcn/ui primitives
  src/pages/              23 pages
drizzle/
  schema.ts               Postgres schema (11 tables, 16 enums)
  relations.ts            empty stub
  supabase_init.sql       hand-written Bootstrap SQL for Supabase
  migrations/ meta/       MySQL legacy migrations (0000–0003) — superseded
shared/
  const.ts                shared constants (cookie name, messages)
  types.ts                re-exports schema types + errors
  _core/errors.ts         HTTP error helpers
patches/wouter@3.7.1.patch  Wouter Switch route introspection patch
```

## External Services

| Service | Use | Where |
|---|---|---|
| Supabase Auth | token verify, user upsert | `server/_core/supabase.ts` |
| Supabase Storage | audio + generated images | `server/storage.ts` |
| OpenAI chat | scoring, coaching, explanations, model answers | `server/_core/llm.ts` |
| OpenAI Whisper | speaking transcription | `server/_core/voiceTranscription.ts` |
| OpenAI DALL-E | image gen (unused by routers) | `server/_core/imageGeneration.ts` |
| eSewa | NPR payments | `server/payment/esewa.ts` |
| Khalti | NPR payments | `server/payment/khalti.ts` |
| Google Maps | REST client (unused by routers) | `server/_core/map.ts` |
| Owner webhook | notifications (Slack/Discord style) | `server/_core/notification.ts` |

## Known Dead Code / Issues

- `server/webhooks/paymentWebhook.ts` — never mounted by any router.
- `server/email/emailService.ts` — never imported; `sendEmail` is a log stub.
- `server/admin/adminAuth.ts` — never imported (role enforced inline).
- `server/_core/{imageGeneration,map,dataApi}.ts` — no importers.
- eSewa MD5 signs with a hardcoded test secret `"8gBm/:&EnhH.1/q"`.
- `paymentRouter.initiateESewaPayment` hardcodes `amount: 1000` NPR and
  returns `paymentId: 0`.
- `normalizeToPTE` comment says S-curve but implementation is linear.
- Seed scripts and legacy migrations target MySQL; runtime schema is PostgreSQL.
- `/admin/analytics` and `/admin/settings` menu items have no routes in App.tsx.