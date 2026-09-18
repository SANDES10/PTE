# Setup & Deployment

App runs as a **Vercel serverless** API with a **Supabase PostgreSQL**
database and **Supabase Auth** (Google + email magic link). It can also run as
a persistent Node server locally.

## 1. Local Development

```bash
pnpm install
cp .env.example .env        # fill in values (see ENV.md)
pnpm dev
```

Open `http://localhost:3000`. `pnpm dev` runs `tsx watch server/_core/index.ts`
with `NODE_ENV=development`; the Express app mounts the Vite dev middleware, so
the client is served and hot-reloaded from the same origin.

Other scripts:

```bash
pnpm build     # vite build && esbuild server → dist
pnpm start     # NODE_ENV=production node dist/index.js
pnpm check     # tsc --noEmit (type check)
pnpm test      # vitest run (84 tests)
pnpm format    # prettier --write .
pnpm db:push   # drizzle-kit push (sync schema to DB)
pnpm db:studio # drizzle-kit studio (DB GUI)
```

## 2. Supabase Project Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run the full script in `drizzle/supabase_init.sql`
   (creates all 11 tables + 16 enums + 3 indexes).
3. **Storage** → create a public bucket named `audio` (speaking recordings).
4. **Authentication → Providers**: enable **Google** (add OAuth client from
   Google Cloud Console) and **Email** (magic link).
5. **Authentication → URL configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`,
     `http://localhost:3000/auth/callback`
6. Copy from **Project Settings → API**:
   - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose)
7. Copy Database connection string (URI, **pooler recommended for Vercel**) →
   `DATABASE_URL`.

Generate a secret:

```bash
openssl rand -base64 32   # → JWT_SECRET
```

## 3. Seeding Questions (optional, legacy MySQL scripts)

Seed scripts in `server/*.mjs` target MySQL (`mysql2/promise`) and are
**legacy** — they do not match the PostgreSQL schema. Run them with
`DATABASE_URL` set against a MySQL instance if needed:

```bash
node server/seed-questions.mjs
node server/seed-official-questions.mjs
node server/seed-new-speaking.mjs
node server/expand-questions.mjs    # destructive reset (DELETEs questions)
```

For production PostgreSQL, insert via SQL or `drizzle-kit push` + manual seed.

## 4. Vercel Deployment

1. Push repo to GitHub.
2. Import in [vercel.com](https://vercel.com) (free Hobby plan).
3. Add all env vars from `.env.example` (see ENV.md). Also add
   `OWNER_OPEN_ID` = your Supabase user UUID to make yourself admin.
4. Deploy. Vercel runs `pnpm build` (`installCommand: "pnpm install"`),
   serves `dist/public`, and routes `/api/*` → `api/index.ts`
   (serverless function, maxDuration 60s, memory 1024 MB).

### Make yourself admin

1. Sign in once on the deployed site.
2. Supabase → **Authentication → Users** → copy your user **UUID**.
3. Set Vercel env `OWNER_OPEN_ID` to that UUID and redeploy
   (upsertUser auto-promotes matching openId to admin).
   - Or run SQL: `UPDATE users SET role = 'admin' WHERE "openId" = 'your-uuid';`

## 5. Security Notes

- Never commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` / `JWT_SECRET` to
  the client (`VITE_`-prefixed vars are the only client-exposed ones).
- `service_role` key is server-only (storage writes, token verification).
- Session cookies are `httpOnly`, `secure` on HTTPS, `sameSite=lax`.
- tRPC procedures: `protected` requires a valid session; `admin` requires
  `role === 'admin'`.

## 6. Costs (free tier)

| Service   | Free tier highlights                         |
|-----------|---------------------------------------------|
| Supabase  | 500 MB DB, 1 GB storage, 50k MAU auth       |
| Vercel    | Hobby hosting, serverless functions          |
| OpenAI    | Limited free credits / low-cost `gpt-4o-mini` |