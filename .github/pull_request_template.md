## Outcome

Describe the customer or engineering outcome.

## Architectural boundary

- [ ] The change belongs in the Zuribeans digital estate.
- [ ] Commerce authority remains in `baobab-platform/baobab-trade`.
- [ ] No Baobab database, administrative credential or frontend-owned commerce rule was added.
- [ ] Contract changes were proposed in `baobab-platform/shared` first.

## Verification

- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e` when a customer journey changed

## Security and operations

- [ ] No secret, customer data or administrative token is committed.
- [ ] Environment, runtime and integration documentation is current.
- [ ] Accessibility and failure behaviour were considered.
