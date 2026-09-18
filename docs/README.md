# PTEMaster — PTE Academic Practice Platform

Complete technical documentation for the PTEMaster (formerly "PTE Academic
Practice Platform") codebase.

## About

PTEMaster is a full-stack PTE (Pearson Test of English) Academic practice
platform. Users practice all 20 PTE task types across the four exam sections,
get AI-scored feedback calibrated to the official PTE Academic Score Guide
(v21, Nov 2024), and track progress via analytics, milestones, and a spaced
repetition system (SM-2). Includes payment gateways for Nepali users (eSewa,
Khalti) and an admin/system control panel.

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict, ESM) |
| Frontend | React 19, Vite 7, Tailwind CSS v4 |
| Routing | wouter (custom-patched) |
| API | tRPC v11 + Express 4 (superjson) |
| Data | PostgreSQL via Drizzle ORM (postgres-js driver) |
| Auth | Supabase Auth (Google OAuth + email magic link) + JWT session cookie (jose) |
| AI | OpenAI — `gpt-4o-mini` (chat completions, strict JSON schema), `whisper-1` (audio transcription), `dall-e-3` (image gen, unused) |
| Storage | Supabase Storage bucket `audio` |
| Payments | eSewa and Khalti (Nepal NPR gateways) |
| Hosting | Vercel serverless (`api/index.ts`) + Node server (`server/_core/index.ts`) |
| State/Data fetching | @tanstack/react-query + typed tRPC client |
| UI | shadcn/ui + Radix primitives, framer-motion, recharts, sonner, lucide-react |

## Documentation Index

| Document | Contents |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, layers, data flow, directory layout |
| [SETUP.md](SETUP.md) | Local development, Supabase setup, Vercel deployment, env vars |
| [DATABASE.md](DATABASE.md) | Full schema: all 11 tables, 16 enums, migrations, seed scripts |
| [SERVER.md](SERVER.md) | Server internals: entry points, core infra, tRPC routers, AI engines, scoring, SM-2, payments, admin |
| [CLIENT.md](CLIENT.md) | Client internals: bootstrap, routing, pages, components, hooks, test coverage of UI |
| [TESTING.md](TESTING.md) | All 84 tests: files, cases, coverage, commands, mocking strategy |
| [API.md](API.md) | Complete tRPC procedure inventory, REST routes, external service calls |
| [ENV.md](ENV.md) | Every environment variable, default, and where it is used |
| [CONFIG.md](CONFIG.md) | All config/tooling files (tsconfig, vite, drizzle, prettier, vercel, shadcn) |
| [FEATURES.md](FEATURES.md) | Feature-by-feature breakdown of all implemented phases |

## Quick Facts

- **Package name:** `pte_practice_app` `v1.0.0` (MIT), pnpm-managed (`pnpm@10.4.1`)
- **Scripts:** `dev`, `build`, `start`, `check` (`tsc --noEmit`), `format`, `test` (`vitest run`), `db:push`, `db:studio`
- **Tests:** 84 passing (46 SM-2 + 24 scoring/integration + 13 AI engine + 1 auth logout)
- **Task types:** 20 PTE task types across speaking (7), writing (2), reading (5), listening (6)
- **Score scale:** normalized 10–90, linear map `10 + raw/100*80`, CEFR levels A1–C2
- **AI engines:** four section-specific scoring engines in `server/ai/` (speaking, writing, reading, listening) with chain-of-thought + deterministic pre-scoring
- **Two scoring stacks coexist:** legacy `server/scoring.ts` (used by `responses.submit`) and new `server/ai/*` engines (used by `aiScoring.*`)