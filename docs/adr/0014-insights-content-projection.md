# ADR 0014: Insights content projection and CMS authority

## Status

Accepted

## Context

The public estate needs market-aware editorial articles for professional buyers. The first
Insights increment shipped before ZuriBeans had a consumable Baobab CMS delivery contract, so its
launch article and draft fixtures were stored in the frontend repository.

That operational constraint does not alter platform authority. Accepted Baobab CMS ADR-0011 adopts
Payload as the Content Engine and explicitly assigns articles, editorial taxonomy, SEO metadata,
publication state and publication scheduling to it. CMS ADR-0013 keeps canonical content identity
separate from Payload's internal IDs and URL slugs. CMS ADR-0014 defines deterministic digital
estate, market and locale resolution and excludes draft content from public resolution.

The frontend must therefore distinguish two concerns:

- **canonical editorial authority:** Baobab CMS/Payload;
- **temporary delivery projection:** reviewed, file-backed records packaged with this estate until
  a versioned CMS consumption contract and runtime binding are available.

Calling the frontend authoritative merely because the runtime contract is not yet consumable would
reverse the accepted architecture. An unavailable integration is a delivery gap, not a transfer of
domain ownership.

## Decision

### Authority

Baobab CMS remains authoritative for Insights editorial content, including article identity,
publication state, taxonomy, market/locale applicability, SEO fields and editorial lifecycle.
ZuriBeans owns presentation, request market resolution and fail-closed rendering of the content it
consumes. It does not become a CMS.

### Temporary file-backed projection

`src/lib/content/insights.ts` is a temporary, read-only bootstrap projection. Changes to it remain
reviewed pull requests, but repository review is an operational publication control only; it does
not establish canonical ownership. The projection must not acquire an authoring API, independent
editorial database or competing content lifecycle.

The projection preserves the public safety rules required by the CMS architecture:

- only `published` records resolve publicly;
- draft and out-of-market records fail closed;
- `ZuribeansMarketKey` is reused rather than redefining markets;
- globally unsegmented sitemap entries are limited to content visible in every enabled market;
- request-time market context is authoritative for the rendered estate response.

### Provider boundary

Public routes consume `InsightContentProvider`, not the file array directly.
`FileInsightContentProvider` is the bootstrap adapter. A future CMS adapter will implement the same
read boundary after a versioned delivery contract is pinned in `contracts.lock.yaml`.

The boundary is intentionally read-only and provider-neutral. It describes what the estate needs:

- list published articles for a market and optional category;
- resolve a published article by slug and market;
- list visible categories;
- list globally safe sitemap slugs.

It does not expose Payload collections, database identifiers, authoring commands or direct database
access.

### Identity and migration

`canonicalContentId` is the future mapping field for the canonical CMS content identity. `null`
means the bootstrap record has not yet been reconciled; it does not make the slug canonical.
Slugs remain URL representations and may require governed redirects when CMS content is migrated.

Before switching the runtime adapter, the integration must:

1. publish and version the CMS delivery contract;
2. pin its repository revision and contract path in `contracts.lock.yaml`;
3. reconcile each bootstrap record with canonical CMS identity;
4. prove publication, market and locale resolution parity;
5. preserve existing public URLs or provide redirects;
6. remove the bootstrap records after cutover evidence is retained.

### Contract status

`contracts.lock.yaml` pins the accepted CMS architecture revision as authority evidence while
recording the estate-specific delivery API and capability binding as outstanding. The absence of
that runtime contract must not be described as absence of a canonical Content Engine.

## Consequences

- The duplicate ADR-0011 number is removed; supplier staff review retains ADR-0011.
- Working Insights routes, SEO, sitemap and market behaviour remain unchanged.
- Content retrieval is replaceable without coupling routes to Payload internals.
- The file adapter is an explicit architectural exception with an exit path, not a second source of
  truth.
- CMS unavailability still blocks runtime cutover, but no longer changes domain ownership.
- Automated Insights accessibility coverage joins the dedicated CI accessibility command.

## Deferred integration work

- versioned CMS article and taxonomy delivery schemas;
- Control Plane capability binding and engine-instance resolution for ZuriBeans content reads;
- authenticated preview and editorial workflows;
- event/webhook-driven cache invalidation;
- canonical identity reconciliation and redirect migration;
- richer structured body and managed media delivery.

These are Baobab CMS integration tasks. They must not be implemented as frontend-owned authoring
capabilities.
