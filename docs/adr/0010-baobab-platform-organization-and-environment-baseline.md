# ADR 0010: Baobab Platform organization and frontend environment baseline

## Status

Accepted

## Context

The GitHub organization moved from `nabhold` to `baobab-platform`, the governed repository
declaration moved from `.nabhold/environment.yaml` to `.baobab/environment.yaml`, and Baobab Dev
advanced beyond the 1.3.0 baseline recorded by ADR-0008.

ZuriBeans now consumes the private `baobab-platform/shared` repository for governance contracts and
reusable workflows. Those calls must use immutable post-migration commit SHAs and grant only the
permissions required by the called workflow. The Foundation gate requires `packages: read` to
verify the declared private GHCR image.

The current development and CI profiles are `ghcr.io/baobab-platform/baobab-dev:1.4.2-frontend`
and `1.4.2-frontend-e2e`. Node.js remains governed on major version 24.

## Decision

Supersede ADR-0008 as the current environment-baseline record.

Use:

- `.baobab/environment.yaml` with schema name
  `baobab-platform-development-environment-contract`;
- `ghcr.io/baobab-platform/baobab-dev:1.4.2-frontend` for Codespaces and compatible local
  development;
- `ghcr.io/baobab-platform/baobab-dev:1.4.2-frontend-e2e` for browser-dependent CI;
- immutable post-migration SHAs for reusable workflows and contracts from
  `baobab-platform/shared`;
- `packages: read` only for jobs that must resolve or verify private GHCR packages.

Repository visibility and Shared workflow access are organization governance controls. Application
code must not work around them by copying centrally governed workflows into this repository.

## Consequences

- Environment declarations, runtime images, contracts and reusable workflows share one organization
  namespace.
- The Foundation workflow can validate the renamed declaration and resolve the governed GHCR image.
- Future Shared or Baobab Dev upgrades require an explicit reviewed pin change.
- ADR-0008 remains historical evidence and is not rewritten to pretend that 1.4.2 was its original
  decision.
