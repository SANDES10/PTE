# Deploy PTEMaster (Supabase + Vercel)

This app runs as a **Vercel serverless** API with a **Supabase PostgreSQL** database and **Supabase Auth** (Google + email magic link).

## 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run the full script in [`drizzle/supabase_init.sql`](drizzle/supabase_init.sql).
3. **Storage** → create a public bucket named `audio` (for speaking recordings).
4. **Authentication** → Providers:
   - Enable **Google** (add OAuth client from Google Cloud Console).
   - Enable **Email** (magic link).
5. **Authentication** → URL configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`
6. Copy from **Project Settings → API**:
   - Project URL → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client)
7. Copy **Database** connection string (URI, pooler recommended for Vercel) → `DATABASE_URL`

## 2. Seed questions (optional)

After tables exist, run seed scripts locally with `DATABASE_URL` set:

```bash
pnpm install
# Update seed scripts to use postgres if needed, or insert via SQL
```

## 3. Vercel deployment

1. Push this repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com) (free Hobby plan).
3. **Environment variables** — add all keys from [`.env.example`](.env.example).
4. Deploy. Vercel runs `pnpm build` and routes traffic through `api/index.ts`.

Generate `JWT_SECRET`:

```bash
openssl rand -base64 32
```

## 4. Make yourself admin

1. Sign in once on the deployed site.
2. Supabase → **Authentication → Users** → copy your user **UUID**.
3. Set Vercel env `OWNER_OPEN_ID` to that UUID and redeploy.
4. Or run in SQL: `UPDATE users SET role = 'admin' WHERE "openId" = 'your-uuid';`

## 5. Local development

```bash
cp .env.example .env
# Fill in values
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Security notes

- Never commit `.env` or expose `SUPABASE_SERVICE_ROLE_KEY` / `JWT_SECRET` in the client.
- `service_role` is only used on the server for storage and token verification.
- Session cookies are `httpOnly`, `secure` on HTTPS, and `sameSite=lax`.

## Costs (free tier)

| Service   | Free tier highlights                          |
|-----------|-----------------------------------------------|
| Supabase  | 500 MB DB, 1 GB storage, 50k MAU auth        |
| Vercel    | Hobby hosting, serverless functions           |
| OpenAI    | Limited free credits / low-cost `gpt-4o-mini`   |
