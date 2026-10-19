# ZuriBeans — secure Codespaces registry access
The image is digest pinned to [baobab-dev v1.4.4](https://github.com/baobab-platform/baobab-dev/releases/tag/v1.4.4).
GitHub pulls the **private GHCR image before devcontainer commands**. A token
inside the container cannot repair an image permission denial.

An org package administrator must grant `baobab-platform/zuribeans`
**Manage Codespaces access** on the `baobab-dev` image and on each relevant
Shared GitHub npm package (`experience-tokens`, `experience-ui`), or
verify a documented inherited-access equivalent. If Actions cannot pull its
container, separately grant **Manage Actions access** on baobab-dev.
New Codespaces must approve the read-only cross-repo requests to
`baobab-platform/shared` and `baobab-platform/baobab-dev`.
Existing Codespaces do not receive these permissions by pulling code alone.

The prebuild runs only offline Node tests. The editor can open without registry
credentials; post-create reads an injected token, checks every **exact** external
`@baobab-platform` package, and runs `pnpm install --frozen-lockfile`.
The project npmrc is non-secret. User `~/.npmrc` contains only an environment
variable reference to `BAOBAB_PACKAGES_READ_TOKEN` (preferred Codespaces
read-only secret) or the approved `GITHUB_TOKEN`. Never put raw tokens in
source, URLs, build args or .env.

After **new** Codespace creation:
```bash
node scripts/codespaces/bootstrap.mjs
baobab-verify --contract
pnpm dev
```
Expected: Node 24.19+, pnpm 11.24.0, all exact Shared package versions,
frozen lockfile installation and private port 3000. 401 is missing/denied
authentication; 403 is package/SSO admission; 404 may conceal private-package
denial or an unpublished version. Do not disable TLS or supply-chain
minimum-release-age restrictions. GHCR CI read proof alone does not prove
**Codespaces** access. Apply this pattern to additional repositories only after
an actual Codespace start has been verified.
