# ADR 0011: Insights content ownership

## Status

Accepted

## Context

The public estate needs an editorial section — "Insights" — for bi-weekly, market-scoped articles
(sourcing notes, trade/logistics updates, market intelligence) aimed at professional buyers. This
is new persistent, publicly-indexable content, so the same "who owns this, who is authoritative"
discovery this repository already runs for market context (ADR-0004) and supplier registration
(ADR-0006) applies here first.

Re-running that discovery for content specifically:

- The platform's own target architecture (`docs/adr/ZuriBeans Go-Live Implementation Plan….md`,
  §9 and §10.53) names a future CMS engine — "Payload CMS" — as the authoritative owner of
  `content.page.manage`, `content.publish`, `content.market-localisation.manage`, etc.
- That engine is Gate ZB-18 of the platform's 29-gate rollout ("Content and Document Management"),
  sequenced well after the gates currently in progress (a live runbook exists only up to
  `docs/ops/zb-06-market-assortment-runbook.md`).
- `contracts.lock.yaml` has no `cms` source pinned — there is no commit, no API, nothing to
  integrate against. Building against a CMS contract that does not exist would repeat the
  Control-Plane-Organisation mistake ADR-0006 explicitly declined to make for suppliers.

There is, in short, no other authoritative system for "what Insights articles exist and are they
published" — so, following the ADR-0006 precedent exactly, Zuribeans must be that system for now.

Unlike supplier registration, Insights content is:

- editorial, not transactional — no lifecycle state machine, no buyer-facing legal consequence;
- authored by a small internal team on a known bi-weekly cadence, not submitted by external users;
- pure public-estate content with no user-scoped or private data.

That combination does not justify this increment's first new database. Reusing `SUPPLIER_DB_URL`
(or provisioning a second Postgres database) for a low-write, editorially-reviewed, PR-friendly
content type would add operational surface (migrations, a second CI Postgres dependency, a write
path) that a two-person editorial team writing one article roughly every two weeks does not need
yet.

## Decision

- **Phase 1 (this increment): file-based, in-repo content**, following the estate's existing
  `src/lib/content/*.ts` convention (`trade.ts`, `quality.ts`, `homepage.ts`, …) rather than a
  database or a headless CMS:
  - `src/lib/content/insights-categories.ts` — an extensible category registry (same pattern as
    `src/lib/supplier/categories.ts`): add a category by adding a registry entry, never by adding
    topic-specific branching to a component.
  - `src/lib/content/insights.ts` — the `InsightArticle` type and the article list. Editorial
    changes ship as a reviewed pull request, exactly like every other page's copy in this repo
    today. No new write path, no new secret, no new database, no new CI dependency.
  - Every article carries an explicit `status: "draft" | "published"`. Public routes and the
    sitemap only ever resolve `"published"` articles — an unfinished or unreviewed article commits
    to the repository without being publicly visible, the same discipline ADR-0006 applies to
    supplier lifecycle states.
- **Market scoping from day one.** `InsightArticle.marketKeys` is `readonly ZuribeansMarketKey[] |
null` — `null` means the article is relevant to every enabled market (company news, cross-market
  trade explainers); a populated array scopes it to specific markets (a Uganda harvest update, a
  South Africa customs change). This reuses the existing `ZuribeansMarketKey` type from
  `src/lib/market/markets.ts` — no parallel market identifier is introduced. The `/insights` index
  filters against `getMarketContext().active`, the same server-resolved market every other public
  route already trusts, per ADR-0004.
- **A reserved migration seam.** Every article carries `canonicalContentId: string | null`,
  populated by nothing in this increment — the same role `supplier_organisations
.canonical_organisation_id` plays in ADR-0006. When Gate ZB-18 lands and Payload CMS is
  contracted in `contracts.lock.yaml`, that field is where reconciliation writes, and existing
  articles migrate rather than requiring a breaking schema change or new URLs (slugs are treated
  as the stable, permanent identifier from the start).
- Insights joins the **Resources** navigation disclosure (`docs/frontend/information-architecture.md`),
  is fully public and indexable, and follows every existing SEO convention: `getPublicPageMetadata`
  for canonical/OG/Twitter tags, a new `getArticleStructuredData` builder in
  `src/lib/seo/structured-data.ts` for `BlogPosting` JSON-LD (only fields the article data actually
  has — no invented `datePublished`, no invented author credentials), and inclusion in
  `src/app/sitemap.ts` restricted to published slugs.

## Explicitly deferred (tracked as gaps, not silently skipped)

- **Self-serve authoring.** Phase 1 is PR-based. If bi-weekly cadence grows past what a
  content-module PR review can comfortably support, the next step is a minimal internal write path
  backed by a Postgres table shaped like the type in `insights.ts` today — not a rewrite, an
  extraction. That decision is explicitly deferred to a follow-up ADR if and when it's needed, not
  decided here.
- **Payload CMS integration.** Tracked as a `contracts.lock.yaml` gap (see that file's diff in this
  change). No adapter, no client, nothing built against an unpublished contract — the same
  discipline ADR-0006 applied to ERP Business Partner mapping and event publishing.
- **Rich content authoring (MDX/embedded media beyond a hero image).** Article bodies are plain
  paragraph arrays for this increment; this repo already ships `@tailwindcss/typography`
  (registered in `globals.css`, previously unused anywhere) specifically so article prose renders
  well without inventing new formatting primitives. Richer authoring is Phase 1.1 scope, not this
  ADR's.
- **Per-market Insights URL segmentation** (e.g. `/za/insights/...`). Explicitly out of scope —
  `information-architecture.md` already records that market-scoped URLs require their own ADR
  covering caching, canonical URLs and Control Plane reconciliation; Insights does not get ahead of
  that decision. Market scoping here is content-level (which articles a market sees), not
  URL-level.

## Consequences

- No new database, no new CI Postgres dependency, no new environment variable, no new secret.
  `runtime/requirements.yaml`'s single database exception (recorded for supplier data under
  ADR-0006) is unaffected.
- `/insights` and `/insights/[slug]` can be statically rendered/ISR'd like other file-content pages
  (`/trade`, `/quality-traceability`) rather than forced dynamic — there is no session-scoped read
  the way supplier/account pages require.
- Editorial velocity is bounded by PR review, not a CMS UI. That is the acknowledged trade-off of
  Phase 1 and is revisited if bi-weekly cadence outgrows it, per the deferred item above.
- When Gate ZB-18 is reached, this ADR's `canonicalContentId` seam and slug-stability decision are
  what make that migration additive rather than disruptive — the same value ADR-0006's reserved
  column is expected to deliver for suppliers.
