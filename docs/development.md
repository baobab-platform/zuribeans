# Development

Copy `.env.example` to `.env.local`, supply a valid Trade Store API URL and publishable
key, then run `pnpm install --frozen-lockfile && pnpm dev`.

`NEXT_PUBLIC_ENABLED_MARKETS` and `NEXT_PUBLIC_DEFAULT_MARKET` control which markets this
deployment serves (see `docs/adr/0004-market-context-resolution.md`); both must use the
candidate market keys in `src/lib/market/markets.ts` (`zuribeans_ug`, `zuribeans_za`). Visit
`/?market=zuribeans_ug` locally to switch markets — the choice persists in a `zb_market` cookie.

`/login` and `/register` require a reachable Trade instance (`MEDUSA_BACKEND_URL`) to
authenticate against; without one, form submissions redirect back with an error rather than
throwing, and `/account` correctly redirects to `/login` for any visitor with no valid session.
See `docs/adr/0005-buyer-session-storage.md`.

`/supplier` and `/sourcing/become-a-supplier` require a reachable Postgres at `SUPPLIER_DB_URL`
(estate-owned, not a Baobab engine database — see `docs/adr/0006-supplier-registration-data-ownership.md`).
Start one locally however you prefer (`docker run -e POSTGRES_USER=zuribeans -e
POSTGRES_PASSWORD=zuribeans_dev -e POSTGRES_DB=zuribeans_dev -p 5432:5432 postgres:16`, or a
native install), then run `pnpm db:migrate` to apply `drizzle/`. After changing
`src/lib/db/schema.ts`, run `pnpm db:generate` to create a new migration file and commit it
alongside the schema change — never hand-edit a file under `drizzle/`.

The repository consumes `ghcr.io/baobab-platform/baobab-dev:1.3.0-frontend` for GitHub
Codespaces and compatible local Dev Containers. Browser-dependent CI uses the
separately published `1.2.6-frontend-e2e` profile.

Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`,
`pnpm perf:budget` and `pnpm test:e2e` before submitting a change. CI runs the public, supplier,
accessibility, SEO, responsive and failure-state journeys across Chromium, Firefox and WebKit
projects; Trade-backed buyer purchasing journeys remain deferred until a controlled Trade test
service and authoritative capability contracts are available.
