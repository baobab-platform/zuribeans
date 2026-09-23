# Zuribeans

Zuribeans is the independently deployable B2B digital estate of the Zuribeans operating
company. It owns the customer experience and consumes commerce from
`baobab-platform/baobab-trade` through Medusa's Store API.

## Boundaries

- Baobab Trade owns products, prices, customers, carts, orders, inventory and fulfilment.
- Baobab ERP and Pulse are reached through backend engine integrations, not from browsers.
- Baobab Control Plane remains authoritative for platform governance.
- `baobab-platform/shared` owns canonical contracts and standards.
- `baobab-platform/infrastructure` owns production deployment and secret injection.

## First vertical slice

The initial application provides a branded home page, live server-rendered catalogue,
product detail, server-only customer identity, protected buyer/supplier boundaries, a
Postgres-backed supplier application, health endpoint, SEO metadata, sitemap, robots policy,
intentional failure states and accessible responsive components. Authentication does not grant
trading approval; buyer purchasing remains unavailable until the authoritative Trade capability
contracts are published.

## Start locally

```bash
cp .env.example .env.local
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

See `docs/architecture.md`, `docs/development.md`, `docs/medusa-integration.md` and the explicit
release decision in `docs/frontend/production-readiness.md`.

## Foundation 4

Codespaces uses `ghcr.io/baobab-platform/baobab-dev:1.4.3-frontend`. The SHA-pinned
Foundation gate validates contract compatibility and reproducibility and scans
source, dependencies, secrets, configuration, and the deployable image.
