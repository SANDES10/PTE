# Testing

Command: `pnpm test` → `vitest run`. Watch: `npx vitest`. Single file:
`npx vitest run server/sm2.test.ts`.

**84 tests, 0 failing, 0 TypeScript errors** (`pnpm check`).

## Config (`vitest.config.ts`)

- `environment: "node"`, root = repo root.
- include: `server/**/*.test.ts`, `server/**/*.spec.ts`.
- Aliases: `@` → `client/src`, `@shared` → `shared`,
  `@assets` → `attached_assets`.

`tsconfig.json` excludes `**/*.test.ts` from type-check.

## Test Files (4)

### 1. `server/ai/aiEngines.test.ts` — 13 tests

Mocks `../_core/llm` (`vi.mock` `invokeLLM` → mockResolvedValueOnce with
`{ choices: [{ message: { content: JSON.stringify(...) } }] }`). Verifies JSON
structure, 10–90 range, traits, edge cases for all four section engines.

- **Speaking AI Engine** (3): Read Aloud all traits; Repeat Sentence
  pronunciation + fluency; Describe Image content.
- **Writing AI Engine** (2): Write Essay (content, form, grammar, vocabulary,
  spelling, development, linguisticRange, coherence, discourse); Summarize
  Written Text (5 traits).
- **Reading AI Engine** (2): MC single correct → 90/raw 1; incorrect → 10/0.
- **Listening AI Engine** (3): Summarize Spoken Text (5 traits); Write from
  Dictation deterministic word matching ("conferance" → rawScore 8/9);
  Highlight Correct Summary → 90.
- **Score range validation** (3): always 10–90; CEFR mapping (≥85 C2, ≥76 C1,
  ≥59 B2, ≥43 B1, ≥29 A2, else A1); WFD empty response → rawScore 0.

### 2. `server/auth.logout.test.ts` — 1 test

tRPC `auth.logout`. Builds fake `TrpcContext` (user + `res.clearCookie`
spy), calls `appRouter.createCaller(ctx).auth.logout()`.

- Asserts `{ success: true }`; exactly 1 cookie cleared; cookie name =
  `COOKIE_NAME`; options `{ maxAge: -1, secure: true, sameSite: "lax",
  httpOnly: true, path: "/" }`.

### 3. `server/pte.scoring.test.ts` — 20 source `it()` / 24 at runtime

Unit tests for `server/scoring.ts` + trpc-router integration.

- **normalizeToPTE** (6): 0→10, 100→90, 50→50, clamps <0→10 / >100→90,
  75% in 60–90.
- **scoreObjectiveTask**:
  - `multiple_choice_single` (3): correct→100, wrong→0, empty→0.
  - `write_from_dictation` (3): exact → 100/normalized ≥70; partial → 10–90;
    empty → ≤20.
  - `reorder_paragraphs` (2): partial credit, max credit.
  - `highlight_incorrect_words` (2): perfect 100, false positives penalized.
  - normalizedScore range (5, forEach over mcs/mcm/fill_blanks_reading/
    highlight_correct_summary/select_missing_word): always 10–90.
- **auth.logout** (1): clears cookie with `maxAge: -1`.
- **questions.list** (2): returns array without DB; accepts
  `{ section: "speaking" }` filter (user: null context).

### 4. `server/sm2.test.ts` — 46 tests

Tests for `computeSm2` and SM-2 helpers.

- **computeSm2** (19): failed reviews (7) — rating 1/2 reset interval→1,
  reps→0, lapses+1, new→learning, review→relearning, EF −0.2 min 1.3, no
  drop below 1.3; successful (11) — rep1→interval 1, rep2→6, rep≥3 → ×EF,
  EF math (q=4 Δ0.0, q=5 +0.1, q=3 −0.14), new→learning, 3+ reps→review,
  lapses preserved, clamp ≤365 / ≥1; dueDate (1) = today + interval.
- **scoreToRating** (5): ≥80→5, 65–79→4, 50–64→3, 35–49→2, <35→1.
- **shouldCreateCard** (2): true <65; false ≥65.
- **getRatingLabel** (1): 1=Again, 2=Hard, 3=Good, 4=Easy, 5=Perfect.
- **formatInterval** (7): 0→"now", 1→"1d", 5→"5d", 7→"1w", 14→"2w",
  30→"1mo", 365→"1y".
- **isCardDue** (2): past true, future false.
- **getUrgencyScore** (3): future/0 lapses → 0; overdue contributes; lapses ×2.
- **calculateRetentionRate** (3): 0/0→0, 10/10→1.0, 8/10→0.8.
- **getIntervalPreviews** (2): 5 keys; lower rating → shorter interval.
- **Full SM-2 sequence** (2): new→learning→review (intervals 1, 6, 6×EF);
  review lapse → relearning, lapses+1.

## Test Summary Table

| File | Tests | Coverage |
|---|---|---|
| `server/ai/aiEngines.test.ts` | 13 | AI section engines, JSON shape, ranges, CEFR |
| `server/auth.logout.test.ts` | 1 | cookie clearing behavior |
| `server/pte.scoring.test.ts` | 24 | normalizeToPTE, objective scoring, router-level |
| `server/sm2.test.ts` | 46 | SM-2 algorithm + all helpers |
| **Total** | **84** | |

## Mocking Strategy

- LLM calls mocked at module boundary (`vi.mock("../_core/llm")`) so engines
  run deterministically.
- tRPC calls executed through `appRouter.createCaller(context)` with fake
  contexts (null user, or user + spy res).
- `beforeEach` uses `vi.resetAllMocks()` for full isolation.