# Configuration & Tooling

## `package.json` (`pte_practice_app` v1.0.0, MIT, ESM)

**Scripts**

| Script | Command |
|---|---|
| `dev` | `cross-env NODE_ENV=development tsx watch server/_core/index.ts` |
| `build` | `vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist` |
| `start` | `cross-env NODE_ENV=production node dist/index.js` |
| `check` | `tsc --noEmit` |
| `format` | `prettier --write .` |
| `test` | `vitest run` |
| `db:push` | `drizzle-kit push` |
| `db:studio` | `drizzle-kit studio` |

**Package manager:** `pnpm@10.4.1` (packageManager field pins 10.4.1; devDep
`pnpm` ^10.15.1).

**pnpm config**
- patchedDependencies: `wouter@3.7.1` → `patches/wouter@3.7.1.patch`.
- overrides: `tailwindcss>nanoid` → `3.3.7`.

**Key deps:** reflect-ignore list — `@trpc/*`, `@supabase/supabase-js`,
`@tanstack/react-query`, drizzle-orm, express, jose, react 19, recharts,
sonner, streamdown, superjson, wouter, zod v4; Radix primitives (30+);
`@aws-sdk/*` (present in deps though unused by direct imports);
`@vercel/node`, `serverless-http` for Vercel.

**Key devDeps:** typescript 5.9.3, vite 7, vitest 2, drizzle-kit, esbuild,
tsx, prettier, tailwindcss 4, postcss, autoprefixer,
`@vitejs/plugin-react`, `@builder.io/vite-plugin-jsx-loc`, `@types/*`.

## `tsconfig.json`

- include: client/src, shared, server, api. exclude: node_modules, build,
  dist, `**/*.test.ts`.
- incremental (tsBuildInfoFile `node_modules/typescript/tsbuildinfo`),
  `noEmit`, `strict`, module `ESNext`, `moduleResolution: bundler`,
  `esModuleInterop`, `skipLibCheck`, `allowImportingTsExtensions`,
  lib `esnext + dom + dom.iterable`, `jsx: preserve`, types
  `["node", "vite/client"]`.
- paths: `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`.

## `tsconfig.server.json`

- extends tsconfig.json. Overrides: `moduleResolution: node`,
  `module: commonjs`, `allowImportingTsExtensions: false`, `strict: false`.
- include: api, server, shared, drizzle (does NOT exclude tests).

## `vite.config.ts`

- Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`,
  `@builder.io/vite-plugin-jsx-loc`.
- Aliases: `@` → `client/src`, `@shared` → `shared/`,
  `@assets` → `attached_assets`.
- `root: client`, `envDir` = repo root, `outDir: dist/public`,
  `emptyOutDir: true`. Server: `host: true`, allowedHosts
  localhost/127.0.0.1, `fs.deny: ["**/.*"]`.

## `vitest.config.ts`

- `environment: "node"`, root = repo root. include:
  `server/**/*.test.ts`, `server/**/*.spec.ts`. Same aliases as vite.

## `drizzle.config.ts`

- `schema: "./drizzle/schema.ts"`, `out: "./drizzle"`,
  `dialect: "postgresql"`, `dbCredentials.url` from `DATABASE_URL`.
- Note: historic MySQL migration SQL in `drizzle/` is superseded; use
  `pnpm db:push` for the Postgres schema.

## `api/index.ts` (Vercel)

- `dotenv/config` + Express `createApp()` wrapped by `serverless-http`
  (`vercelHandler`).

## `vercel.json`

- `installCommand: "pnpm install"`, `buildCommand: "pnpm build"`,
  `outputDirectory: "dist/public"`, framework vite.
- Function (`api/index.ts`): maxDuration 60, memory 1024.
- Rewrites: `/api/(.*)` → `/api`, `/(.*)` → `/index.html`.

## `components.json` (shadcn/ui)

- Style `new-york`, rsc false, tsx true, tailwind `client/src/index.css`,
  baseColor neutral, cssVariables true. Aliases: components `@/components`,
  utils `@/lib/utils`, ui `@/components/ui`, lib `@/lib`, hooks `@/hooks`.

## Prettier (`.prettierrc`)

- semi true, trailingComma es5, singleQuote false, printWidth 80, tabWidth 2,
  useTabs false, bracketSpacing true, bracketSameLine false,
  arrowParens avoid, endOfLine lf, quoteProps as-needed, jsxSingleQuote false,
  proseWrap preserve.

## `.prettierignore`

- node_modules, .pnpm-store, dist, build, *.dist, *.tsbuildinfo, coverage,
  package-lock.json, pnpm-lock.yaml, db/sqlite/log files, .env*, .vscode,
  .idea, OS files.

## ESLint

- **None configured** anywhere in the repo. Prettier only.

## `patches/wouter@3.7.1.patch`

pnpm patch for wouter: in `esm/index.js`, the `Switch` component collects all
`path` props from flattened children into `window.__WOUTER_ROUTES__` (deduped
array) — enables client-side route introspection.

## `.gitignore`

Covers node_modules, build outputs (dist, build, *.dist), env files, IDE/OS
files, logs, runtime data, coverage, tsbuildinfo, npm/yarn/pnpm artifacts,
`.next`/`.nuxt`/`.cache*`, tmp, databases, webdev artifacts (`.webdev/`,
`.manus/`), and OpenCode local config (`.opencode/`, `opencode.json`).

## `shared/` (cross-layer constants)

- `shared/const.ts` — `COOKIE_NAME = "app_session_id"`,
  `ONE_YEAR_MS = 365d`, `AXIOS_TIMEOUT_MS = 30_000`,
  `UNAUTHED_ERR_MSG = 'Please login (10001)'`,
  `NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)'`.
- `shared/_core/errors.ts` — `HttpError` + `BadRequestError(400)`,
  `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)`.
- `shared/types.ts` — re-exports drizzle schema types + errors.