# API Reference

Transport: tRPC v11 over `POST /api/trpc` (superjson). Auth: `app_session_id`
cookie. Three procedure tiers: **public**, **protected** (valid session),
**admin** (role === "admin").

## Root Router Shape

```ts
appRouter = {
  system, auth, questions, sessions, responses, analytics, profile,
  aiCoach, srs, aiScoring, payment, systemAdmin,
}
```

## tRPC Routes

### system
| Procedure | Tier | Input → Output |
|---|---|---|
| `system.health` | public | `{ timestamp: number ≥ 0 }` → `{ ok: true }` |
| `system.notifyOwner` | admin | `{ title, content }` → `{ success: boolean }` |

### auth
| Procedure | Tier | Output |
|---|---|---|
| `auth.me` | public | `User \| null` |
| `auth.logout` | public | clears cookie → `{ success: true }` |

### questions
| Procedure | Tier | Input → Output |
|---|---|---|
| `questions.list` | public | `{ section?, taskType?, difficulty?, limit 1..200 }` → `Question[]` |
| `questions.getById` | public | `{ id }` → `Question` (404 if missing) |
| `questions.count` | public | → `number` |

### sessions
| Procedure | Tier | Input → Output |
|---|---|---|
| `sessions.create` | protected | `{ sessionType, section?, mode?, totalQuestions }` → `{ id }` |
| `sessions.getById` | protected | `{ id }` → `PracticeSession` (ownership-checked) |
| `sessions.complete` | protected | `{ id }` → recomputed session + diagnostic feedback + optional milestone |
| `sessions.getReport` | protected | `{ id }` → session + responses joined with questions + enabling skills |
| `sessions.myHistory` | protected | `{ limit = 20 }` → completed sessions |
| `sessions.getResponses` | protected | `{ sessionId }` → responses |

### responses
| Procedure | Tier | Input → Output |
|---|---|---|
| `responses.submit` | protected | `{ sessionId, questionId, responseText?, audioUrl?, selectedOptions?, timeTaken? }` → `{ responseId, ...score, transcription? }` (legacy scoring) |
| `responses.transcribeAudio` | protected | `{ audioUrl }` → `{ transcription }` |

### analytics
| Procedure | Tier | Input → Output |
|---|---|---|
| `analytics.myStats` | protected | → aggregate stats + enabling skills |
| `analytics.todayTarget` | protected | → today's practice target |
| `analytics.milestones` | protected | → milestones |
| `analytics.generateTarget` | protected | `{ targetMinutes = 30, focusSkills? }` → upserted target |

### profile
| Procedure | Tier | Input |
|---|---|---|
| `profile.update` | protected | `{ targetScore 10..90?, currentLevel?, dailyGoalMinutes 5..240?, notificationsEnabled? }` |

### aiCoach
| Procedure | Tier | Input → Output |
|---|---|---|
| `aiCoach.getTaskFeedback` | protected | `{ responseId }` → `TaskFeedback` |
| `aiCoach.getCoachingPlan` | protected | `{ targetScore = 65 }` → `PersonalizedCoachingPlan` |
| `aiCoach.getMicroFeedback` | protected | `{ taskType, errorType, studentExample, correctExample? }` |
| `aiCoach.getModelAnswer` | protected | `{ questionId, taskType }` → model answer (band 90) |

### srs
| Procedure | Tier | Input → Output |
|---|---|---|
| `srs.getDueCards` | protected | `{ limit = 20 }` → due cards + interval previews |
| `srs.getUpcomingCards` | protected | `{ limit = 10 }` |
| `srs.getStats` | protected | → totals/due/retention/byState/14d logs |
| `srs.recordReview` | protected | `{ cardId, rating 1..5, responseText?, normalizedScore? }` → `{ nextInterval, nextDueDate, ratingLabel, newState }` |
| `srs.addCard` | protected | `{ questionId, sourceResponseId?, lastScore? }` |
| `srs.autoCreateFromSession` | protected | `{ sessionId }` → auto-created cards (score < 65) |
| `srs.resetCard` | protected | `{ cardId }` → reset to new/2.5/1 |

### aiScoring (section engines)
| Procedure | Tier | Input |
|---|---|---|
| `aiScoring.scoreSpeak` | protected | `{ responseId, audioUrl?, transcription? }` → `SpeakingScoreResult` (persisted) |
| `aiScoring.scoreWrite` | protected | `{ responseId, responseText? }` → `WritingScoreResult` (persisted) |
| `aiScoring.scoreRead` | protected | `{ responseId, selectedOptions?, orderedItems?, filledBlanks? }` → `ReadingScoreResult` (persisted) |
| `aiScoring.scoreListen` | protected | `{ responseId, responseText?, selectedOptions?, filledBlanks? }` → `ListeningScoreResult` (persisted) |
| `aiScoring.getScore` | protected | `{ responseId }` → read-only breakdown |

### payment
| Procedure | Tier | Input → Output |
|---|---|---|
| `payment.getPlans` | public | → `SubscriptionPlan[]` |
| `payment.initiateESewaPayment` | protected | `{ planId, productName, productDescription }` → `{ paymentUrl, referenceId, paymentId: 0 }` |
| `payment.verifyESewaPayment` | protected | `{ transactionCode }` |
| `payment.initiateKhaltiPayment` | protected | `{ planId, productName, productDescription, amount, customerEmail, customerPhone }` → `{ pidx, paymentUrl, referenceId }` |
| `payment.verifyKhaltiPayment` | protected | `{ pidx, transactionId, amount }` |
| `payment.getPaymentHistory` | protected | → user payments (20) |
| `payment.getActiveSubscription` | protected | → subscription + plan |
| `payment.cancelSubscription` | protected | `{ subscriptionId }` (ownership-checked) |

### systemAdmin (admin only)
| Procedure | Input → Output |
|---|---|
| `systemAdmin.getSystemHealth` | mock health metrics |
| `systemAdmin.getSystemStats` | real stats (`adminDb.getSystemStatistics`) |
| `systemAdmin.getActivityLogs` | `{ limit = 50, offset = 0, filter? }` |
| `systemAdmin.toggleUserBan` | `{ userId, reason? }` (log-only) |
| `systemAdmin.updateSystemConfig` | `{ key, value }` (log-only) |
| `systemAdmin.triggerBackup` / `getBackupHistory` | mock |
| `systemAdmin.getApiKeys` / `rotateApiKey` | mock |
| `systemAdmin.getUserEngagement` | `{ days = 30 }` |
| `systemAdmin.getLearningPerformance` | metrics |
| `systemAdmin.getPaymentRevenue` | metrics |
| `systemAdmin.getCustomerLTV` | LTV + top customers |
| `systemAdmin.getChurnRetention` | `{ days = 30 }` |
| `systemAdmin.getSystemAlerts` | mock alerts |
| `systemAdmin.acknowledgeAlert` | mock |
| `systemAdmin.getPerformanceMetrics` | mock |

## REST Routes (non-tRPC)

| Route | Method | Auth | Behavior |
|---|---|---|---|
| `/api/auth/session` | POST | — | body `{ access_token }` → verifies Supabase token, upserts user, sets `app_session_id` cookie |
| `/api/oauth/callback` | GET | — | legacy 302 → `/login` |
| `/api/upload-audio` | POST | session required (401) | raw audio body (`audio/*`, ≤10 MB) → Supabase Storage `audio/user-{userId}/{nanoid()}.webm` → `{ url, key }` |
| `/api/trpc` | POST | per-procedure | tRPC middleware |

## External API Calls (server-initiated)

- **OpenAI chat completions** — `POST {OPENAI_API_URL}` Bearer
  `OPENAI_API_KEY`, model `OPENAI_MODEL` (gpt-4o-mini), `max_tokens: 4096`.
- **OpenAI audio transcriptions** — `POST https://api.openai.com/v1/audio/transcriptions`,
  model `whisper-1`, `verbose_json`.
- **Supabase Auth** — `auth.getUser(accessToken)` (admin client).
- **Supabase Storage** — `storage.from(bucket).upload(key, data, { upsert: true })`
  + `getPublicUrl`.
- **eSewa** — `https://esewa.com.np/epay/main` (initiate, MD5 signature) /
  prod or `https://uat.esewa.com.np/epay/main` (test).
- **Khalti** — `POST /api/v2/epayment/initiate/` + `/api/v2/epayment/lookup/`
  (test host `a.khalti.com`, headers `Key {public/secretKey}`).
- **Owner webhook** — `POST {OWNER_NOTIFICATION_WEBHOOK}` (notification.ts).

## Error Convention

- tRPC: `UNAUTHED_ERR_MSG` = "Please login (10001)",
  `NOT_ADMIN_ERR_MSG` = "You do not have required permission (10002)".
- Client (main.tsx) hard-redirects to `/login` on `UNAUTHED_ERR_MSG`.
- HTTP helpers in `shared/_core/errors.ts`: `BadRequestError(400)`,
  `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)`.