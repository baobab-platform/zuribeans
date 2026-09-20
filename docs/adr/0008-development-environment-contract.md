# ADR 0008: Governed frontend development environment contract

## Status

Superseded by ADR-0010

## Context

ADR-0003 pinned the ordinary and browser-capable development environments to the 1.2.6 release.
The repository's authoritative `.baobab/environment.yaml` now requires the `1.3.0-frontend`
profile for Codespaces and compatible local environments. Browser and security workflows still use
the separately governed `1.2.6-frontend-e2e` and `1.2.6-frontend` images available to those jobs.

The deployable container and current governed development runtime use Node.js 24, while
`package.json` still declared Node.js 22. That mismatch produced warnings and weakened strict runtime
validation.

## Decision

Supersede ADR-0003. Use `ghcr.io/baobab-platform/baobab-dev:1.3.0-frontend` for Codespaces and compatible
local development, exactly as declared by `.baobab/environment.yaml`. Keep workflow-specific 1.2.6
images pinned until the corresponding governed replacement profiles are published and adopted in a
dedicated environment update.

Declare Node.js `>=24.19.0 <25` as the application engine. The production Docker image remains on a
Node.js 24 patch release and may advance within that major line through an explicit reviewed change.

## Consequences

- Local, package and deployable runtime declarations no longer disagree about the Node major.
- Workflow container versions remain explicit rather than being inferred from the Codespaces
  profile.
- A workflow image update must verify Playwright browsers, native libraries, pnpm, Foundation gates
  and deployable-image parity before adoption.
