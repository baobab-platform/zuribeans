# ADR 0003: Standard Codespaces image

## Status

Superseded by ADR-0008. This record is retained as the decision made for the 1.2.6 environment
baseline.

## Decision

Use the published `ghcr.io/nabhold/baobab-dev:1.2.6-frontend` image for Codespaces
and compatible local Dev Containers. Use `1.2.6-frontend-e2e` only for browser-dependent
CI jobs.

## Consequences

The estate follows the organisation-standard development environment while keeping daily
frontend work separate from the larger browser-dependent CI profile.
