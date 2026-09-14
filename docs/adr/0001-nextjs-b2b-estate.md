# ADR 0001: Next.js B2B digital estate

## Status

Superseded by ADR-0007. This record is retained as the decision made for the original Next.js 15
baseline.

## Decision

Zuribeans uses Next.js 15, React 19, strict TypeScript, App Router and server-first data
retrieval. It is a B2B customer experience consuming Baobab Trade, not a Baobab engine.

## Consequences

Shared ADR-0001's older B2C/Astro classification requires reconciliation. Commerce rules
remain in Trade even when doing so delays a frontend feature.
