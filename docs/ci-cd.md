# CI/CD

How code gets from a branch to slmarket.lk, and the one-time setup it needs.

## Branches and environments

| Branch      | Deploys to                          | Database        | How                         |
| ----------- | ----------------------------------- | --------------- | --------------------------- |
| feature/\*  | Vercel PR preview (automatic)       | dev (preview)   | Vercel git integration      |
| `dev`       | **development**: dev site           | dev             | GitHub Actions `deploy.yml` |
| `main`      | **production**: slmarket.lk         | production      | GitHub Actions `deploy.yml` |

Flow: `feature/*` → PR into `dev` → PR from `dev` into `main` (a release).
Only `dev` and `hotfix/*` may open PRs into `main`; CI enforces it.

## What runs

**`ci.yml`** runs on every PR into `dev` or `main`, and again before every deploy:

| Job                    | Checks                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Lint                   | `npm run lint`: ESLint over the repo, no warnings allowed                                              |
| Type-check             | `npm run typecheck`: no type errors beyond the legacy baseline (see below)                             |
| Unit tests             | `npm test` (Vitest)                                                                                    |
| Build and smoke test   | migrations applied to an empty Postgres, schema drift check, `next build`, app started, key pages = 200 |
| Dependency review      | PRs only: new dependencies with high-severity advisories fail                                          |
| Branch policy          | PRs into `main` only: source must be `dev` or `hotfix/*`                                               |
| **CI passed**          | the single check to require in branch protection                                                       |

**`deploy.yml`** runs on every push to `dev` or `main`:
CI → `prisma migrate deploy` on that environment's database → `vercel build` → `vercel deploy`
→ smoke test of the live URL. Vercel's own git deploys for `dev` and `main` are off
(`vercel.json`), so nothing reaches those environments without passing CI.

**`codeql.yml`**: security analysis on PRs, pushes and weekly. Results: Security → Code scanning.

**Dependabot**: weekly grouped dependency and GitHub Actions updates as PRs into `dev`.

## The type-check baseline

Some legacy code (seller subscriptions, PayHere billing, reels, the old dashboard
and admin views) was written against an older schema and has type errors.
They are listed, per file and error code, in `scripts/ci/typecheck-baseline.json`.
CI fails if any file gets an error that is not in the baseline, and also when
errors are fixed but the baseline still allows them, so it can only shrink:

```bash
npm run typecheck          # what CI runs
npm run typecheck:update   # after fixing legacy errors; commit the baseline
```

Never run `typecheck:update` to hide a new error. Because CI owns type safety,
`next.config.ts` sets `typescript.ignoreBuildErrors` (the build's all-or-nothing
check would fail every deploy on the legacy code). Delete that line and the
baseline once the legacy code is fixed or removed.

## One-time setup

### 1. Vercel

1. Project → Settings → Environment Variables:
   - **Production**: production values (production `DATABASE_URL`, keys, `NEXT_PUBLIC_APP_URL=https://slmarket.lk`, ...).
   - **Preview**: development values, and for anything that must differ on the dev site, add a
     value scoped to the **`dev`** branch (Preview → "Select a custom Preview branch" → `dev`),
     e.g. the dev `DATABASE_URL` and `NEXT_PUBLIC_APP_URL=https://dev.slmarket.lk`.
   - Never set `SMTP=logs` in Vercel; it is for local development and refuses to run in production.
2. Optional fixed dev address: Project → Settings → Domains → add `dev.slmarket.lk`
   (no git branch needed; the deploy workflow points it at each new dev deployment).
3. Account Settings → Tokens → create a token for GitHub Actions (scope: this team/project).
4. Run `npx vercel link` locally once; `.vercel/project.json` holds `orgId` and `projectId`.
5. If Deployment Protection is on for previews: Project → Settings → Deployment Protection →
   Protection Bypass for Automation → create a secret (used by the dev smoke test).

### 2. GitHub: Settings → Environments

Create two environments:

| Environment     | Secrets                      | Protection                                                   |
| --------------- | ---------------------------- | ------------------------------------------------------------ |
| `development`   | `DATABASE_URL`, `DIRECT_URL` (dev database) | Deployment branches: `dev` only                 |
| `production`    | `DATABASE_URL`, `DIRECT_URL` (production database) | Deployment branches: `main` only; required reviewers (recommended) |

With required reviewers on `production`, every release waits for an approval
before migrations run on the production database.

### 3. GitHub: Settings → Secrets and variables → Actions

| Kind     | Name                              | Value                                    |
| -------- | --------------------------------- | ---------------------------------------- |
| Secret   | `VERCEL_TOKEN`                    | token from Vercel step 3                 |
| Secret   | `VERCEL_AUTOMATION_BYPASS_SECRET` | optional, Vercel step 5                  |
| Variable | `VERCEL_ORG_ID`                   | `orgId` from `.vercel/project.json`      |
| Variable | `VERCEL_PROJECT_ID`               | `projectId` from `.vercel/project.json`  |
| Variable | `DEV_DOMAIN`                      | optional, e.g. `dev.slmarket.lk`         |

### 4. GitHub: branch protection (Settings → Rules → Rulesets)

For `main` and `dev`:
- Require a pull request before merging (1 approval for `main`).
- Require status checks: **CI passed** (and **Analyze** from CodeQL if wanted).
- Block force pushes and deletions.

Also turn on Settings → Code security → Secret scanning and Push protection,
so a pushed API key is blocked before it lands.

## Day to day

- Run `npm run lint && npm run typecheck && npm test` before pushing.
- A migration must work while the previous release is still running:
  add columns and tables first, remove old ones in a later release.
- A failed production smoke test leaves the new deployment live:
  roll back in Vercel (Deployments → previous → Instant Rollback).
- Local email: `SMTP=logs` in `.env` writes every email, verification codes
  included, to `logs/emails.log` instead of sending it.
