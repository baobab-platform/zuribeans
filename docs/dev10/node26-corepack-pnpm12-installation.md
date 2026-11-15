# DEV-10 — Node 26 / Corepack / native pnpm 12 consumer installation

Status: **candidate guidance; qualification in ZuriBeans PR #168 pending**. Prepared 2026-11-14.

## Context and authoritative sources

- Baobab Dev `config/versions.yaml` currently describes Node 26.13.1, native pnpm 12.16.1 and separately installed Corepack 0.36.0. These are development candidates; the future v1.5.2 image's published manifest, exact binary hashes, image digest and attestations must be checked before promotion.
- pnpm installation: https://pnpm.io/installation/ — pnpm 12 is a native executable and supports Node 26. Node is needed only for the npm-package installation path, not to run the native executable.
- npm 12 installation script policy: https://docs.npmjs.com/cli/v12/commands/npm-install/ — dependency install scripts are opt-in. `--allow-scripts=pnpm` is intended for global/one-off contexts; do not use `--dangerously-allow-all-scripts`.
- pnpm package manager selection: https://github.com/pnpm/pnpm.io/blob/main/docs/settings/cli.md — `pmOnFail: error` refuses mismatched `packageManager` rather than downloading an alternative version.

## ZuriBeans PR #168 findings

1. **EEXIST**: installing Corepack and pnpm into the same global Node prefix caused the Corepack-created `pnpm` shim to conflict with npm's attempted `pnpm` binary. This is a path-ownership collision, not a Node 26 application incompatibility.
2. **npm 12 lifecycle policy**: a subsequent prefix-scoped npm installation reported `pnpm@12.21.0 (preinstall/postinstall)` scripts were not allowed. It did not yield the expected runnable native executable. Running an assumed legacy JS entrypoint did not resolve the issue.
3. The ZuriBeans candidate probe has not yet qualified private BXS installation, frozen lockfile, lint, typecheck, migrations, tests, build or Playwright E2E. Do not claim compatibility or merge based on the baseline CI passing.

## Recommended production image installation — native pnpm is authoritative

In baobab-dev's v1.5.2 image build, install the *exact* platform-specific native pnpm release binary independently of Corepack. Resolve the official upstream binary and per-architecture SHA-256 into the reviewed version lock; verify with `sha256sum -c` before placing it in a dedicated directory on PATH. Check `command -v pnpm`, `pnpm --version` and `corepack --version` inside the built image, as the actual non-root Codespaces user. Do not install npm pnpm into Corepack's global shim directory.

Set `pnpm_config_pm_on_fail=error` and match consumers' `packageManager` exactly to the native version. Do not let Corepack download or silently substitute a second pnpm binary. Keep a distinct Corepack installation for Yarn where required. Prefer an immutable image digest, signature and provenance verification for consumers; a mutable `:1.5.2-frontend` tag alone is insufficient.

## Disposable npm-package probe workaround

For testing a candidate pnpm version *before* a corresponding native binary is published into GHCR, isolate it from Corepack's global prefix and explicitly permit only pnpm's npm 12 lifecycle scripts:

```bash
npm install --global --no-audit --no-fund corepack@0.36.0
npm install --global --prefix "$RUNNER_TEMP/pnpm12" \
  --allow-scripts=pnpm --strict-allow-scripts \
  --no-audit --no-fund pnpm@12.21.0
"$RUNNER_TEMP/pnpm12/bin/pnpm" --version
echo "$RUNNER_TEMP/pnpm12/bin" >> "$GITHUB_PATH"
```

The isolated prefix is a **probe-only technique**, not a recommendation to make npm-package pnpm the canonical v1.5.2 image binary. Review installer scripts and package integrity before approval. Avoid `npm --force`, broad lifecycle exemptions, and removing security gates.

## Consumer promotion checklist

1. Verify the actual v1.5.2 manifest and multi-arch native pnpm binary checksums, image digest, signature and attestations; do not assume the current candidate version numbers will be shipped.
2. Align ZuriBeans `package.json#packageManager`, Node engines, `.nvmrc`, lockfile, `.baobab/environment.yaml`, devcontainer image digest and Codespaces bootstrap with the **qualified** image toolchain.
3. Confirm no competing `pnpm` shim is earlier on PATH and no implicit package-manager downloads occur.
4. Regenerate and freeze the pnpm 12 lockfile; install private BXS packages under least-privilege credentials and verify reproducible cold and warm installs.
5. Run lint, typecheck, PostgreSQL 17 migration, unit tests, Next.js build, Playwright 1.65 browser revision install/E2E, accessibility, visual regression and performance budgets.
6. Verify both GitHub Actions and non-root Codespaces runtime, including writable caches and private-package access. Record evidence and negatives; merge only after qualification.
7. Preserve rollback to the previous verified Node 24/pnpm 11 + GHCR v1.5.1 consumer configuration.

## Version drift warning

The ZuriBeans PR #168 disposable probe targets Node 26.13.0, pnpm 12.21.0 and Playwright 1.65.0; the baobab-dev source manifest observed during this investigation targets Node 26.13.1 and pnpm 12.16.1. The eventual image version manifest, not these independently selected probe numbers, determines production consumer pins. A successful probe for one version does **not** certify another.

## Codespaces v1.5.2 candidate consumer preflight (shared estate pattern)

The `frontend` profile supplies Node, npm, native pnpm and separately installed Corepack. It **does not** supply browser binaries; `frontend-e2e` is the browser-equipped profile. Never run `npm install -g pnpm` or `corepack enable` in `postCreateCommand`: these can overwrite or shadow the image's verified native pnpm.

ZuriBeans now includes `scripts/codespaces/dev10-v152-preflight.mjs`. In a **disposable candidate Codespace**, after the exact v1.5.2 image digest is available and the repository's packageManager/lockfile have been updated and qualified, run:

```bash
BAOBAB_EXPECT_NODE_MAJOR=26 \
BAOBAB_EXPECT_PNPM=12.21.0 \
BAOBAB_EXPECT_COREPACK=0.36.0 \
BAOBAB_EXPECT_PLAYWRIGHT=1.65.0 \
node scripts/codespaces/dev10-v152-preflight.mjs
```

The values above describe the successful ZuriBeans disposable Actions probe, **not** the final v1.5.2 image contract. Use the versions actually published in the image's immutable manifest. For `frontend-e2e`, set `BAOBAB_REQUIRE_BROWSERS=1` to check Playwright browser resolution; separately execute `pnpm run test:e2e` for a real browser acceptance test. The preflight is read-only and refuses mismatches; it does not certify image provenance or private-package authorization.

The existing ZuriBeans `bootstrap.mjs` intentionally requires Node 24/pnpm 11 and invokes `corepack pnpm`; it must be migrated together with the committed packageManager, lockfile and image digest. Do not switch only the image tag and leave the old bootstrap: Codespaces would fail or select the wrong package manager. In the v1.5.2 consumer migration, invoke native `pnpm` directly for private BXS metadata checks and `pnpm install --frozen-lockfile`, with `pnpm_config_pm_on_fail=error`.

**Evidence:** ZuriBeans PR #168 Actions probe run 43670200780 passed 311 Playwright 1.65.0 E2E tests across configured browser projects, plus candidate dependency install, source tests and build. This is **not** a disposable Codespaces run or published v1.5.2 image verification. Nabhold, Thamani and Equator & Estate must each qualify their own manifests, browser suites and private package access; shared profile does not imply identical application behavior.
