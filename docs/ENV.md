# Environment Variables

All env vars, defaults, and usage. Read at module load into a single `ENV`
object in `server/_core/env.ts`. Client-visible vars are `VITE_`-prefixed.

| Variable | Default | Used for | Client-visible? |
|---|---|---|---|
| `VITE_APP_ID` | `pte-practice` | session payload appId | yes |
| `JWT_SECRET` | — | HS256 session JWT signing (jose) | no |
| `DATABASE_URL` | — | PostgreSQL connection (postgres-js driver) | no |
| `OWNER_OPEN_ID` | — | auto-promote user to admin on upsert | no |
| `NODE_ENV` | — | `development`/`production` switches (server vs static) | indirect |
| `PORT` | `3000` | Node server listen port | no |
| `SUPABASE_URL` | fallback `VITE_SUPABASE_URL` | Supabase admin client (auth verify, storage) | no |
| `VITE_SUPABASE_URL` | — | Supabase browser client + fallback | yes |
| `SUPABASE_ANON_KEY` | fallback `VITE_SUPABASE_ANON_KEY` | Supabase admin client | no |
| `VITE_SUPABASE_ANON_KEY` | — | Supabase browser client | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase admin client (server only) | no |
| `SUPABASE_STORAGE_BUCKET` | `audio` | storage uploads (voice + generated images) | no |
| `OPENAI_API_KEY` | — | chat completions, whisper, dall-e | no |
| `OPENAI_API_URL` | `https://api.openai.com/v1/chat/completions` | chat endpoint override | no |
| `OPENAI_MODEL` | `gpt-4o-mini` | scoring/coaching model | no |
| `GOOGLE_MAPS_API_KEY` | — | Google Maps REST client (unused by routers) | no |
| `OWNER_NOTIFICATION_WEBHOOK` | — | owner notifications (Slack/Discord style) | no |
| `VITE_FRONTEND_URL` | `http://localhost:3000` | Khalti return_url | yes |
| `VITE_FRONTEND_FORGE_API_URL` | `forge.butterfly-effect.dev` proxy + `/v1/maps/proxy/maps/api/js` | Google Maps JS loading in Map.tsx | yes |
| `VITE_FRONTEND_FORGE_API_KEY` | — | Maps proxy API key | yes |
| `ESEWA_MERCHANT_CODE` | `TESTMERCHANT` (`ESEWA_CONFIG.merchantCode`) | eSewa initiate/verify | no |
| `KHALTI_PUBLIC_KEY` | `test_public_key` (`KHALTI_CONFIG.publicKey`) | Khalti initiate (Key header) | no |
| `KHALTI_SECRET_KEY` | `test_secret_key` | Khalti lookup + optional webhook HMAC | no |
| `RESEND_API_KEY` | — | email service (stub, dead code) | no |
| `SENDER_EMAIL` | `noreply@ptepractice.com` | email templates (stub) | no |

## `.env.example` contents

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_STORAGE_BUCKET=audio
JWT_SECRET=
VITE_APP_ID=pte-practice
OWNER_OPEN_ID=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OWNER_NOTIFICATION_WEBHOOK=
PORT=3000
```

> eSewa/Khalti test credentials are `ESEWA_CONFIG` / `KHALTI_CONFIG` in
> `server/routers/paymentRouter.ts` (defaults: eSewa merchant `TESTMERCHANT` +
> hardcoded MD5 test secret; Khalti test keys).