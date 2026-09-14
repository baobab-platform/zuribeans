# ADR 0007: Next.js 16 frontend baseline

## Status

Accepted

## Context

ADR-0001 accepted Next.js 15, React 19, strict TypeScript, App Router and server-first retrieval. The
repository has since advanced to Next.js 16.3.3 while preserving the architectural boundaries in
that decision. Leaving ADR-0001 marked as the current framework record makes documentation diverge
from the deployable application.

## Decision

Supersede ADR-0001's framework baseline with Next.js 16, React 19, strict TypeScript, App Router and
React Server Components by default. Browser-state and browser-API interactions remain narrow Client
Component boundaries. The ZuriBeans application layer and adapters remain the only path from UI code
to Baobab services; this version reconciliation does not alter domain authority, authentication,
market resolution, cache audiences or supplier ownership.

Align `react` and `react-dom` on 19.2.8 because React rejects mixed runtime versions. Keep Tailwind
CSS 3 for this programme. The Next.js ESLint configuration migration recorded in the
production-readiness assessment requires a separate dependency change rather than being hidden
inside this ADR reconciliation.

## Consequences

- Next.js 16 file conventions and runtime behavior are authoritative for frontend implementation.
- Route failure boundaries use the Next.js 16 `error`, `global-error` and `not-found` contracts.
- A future major framework upgrade must supersede this record and re-verify caching, proxy behavior,
  metadata, Server Actions and deployment output.
- The existing Baobab and ZuriBeans ownership decisions remain unchanged.
