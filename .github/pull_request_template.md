## What and why

<!-- What changes for users or developers, and why. Link the issue if there is one. -->

## How it was checked

<!-- Pages opened, screen sizes, flows tried, tests added. Screenshots for UI changes. -->

## Checklist

- [ ] Targets `dev` (only `dev` or `hotfix/*` go into `main`)
- [ ] `npm run lint`, `npm run typecheck` and `npm test` pass locally
- [ ] Schema change? A migration is included, and it is safe while the previous release is still running
- [ ] New environment variable? Added to `.env.example` and to Vercel (development and production)
- [ ] No secrets, `.env` files or personal data in the diff
