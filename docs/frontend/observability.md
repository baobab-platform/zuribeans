# Frontend observability contract

Status: Prepared; provider and ingestion contract blocked

Reviewed: 2026-09-14

ZuriBeans needs correlated operational evidence without turning the browser into a Baobab integration
layer or leaking customer, supplier or commercial data. No telemetry vendor or ingestion endpoint is
accepted in this repository, so Gate 18 defines the boundary and does not add a vendor SDK, global
client instrumentation or an ungoverned logging endpoint.

## Required signal classes

| Signal                        | Minimum dimensions                                                     | Never include                                                   |
| ----------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| Unhandled client/server error | release, route template, correlation ID, market key, error class       | stack arguments, form values, tokens, customer/supplier records |
| Baobab API failure            | adapter, operation, status class, duration, correlation ID, market key | request authorization, response body, private price             |
| Authentication failure        | operation, safe reason class, correlation ID                           | email, password, JWT, cookie                                    |
| Supplier workflow failure     | operation, safe reason class, correlation ID                           | application payload, bank data, documents                       |
| Purchasing failure            | capability, operation, safe reason class, correlation ID               | cart lines, contract price, payment data                        |
| Web Vitals                    | route template, market key, device class, metric value, release        | visitor identity, exact private URL/query data                  |

The correlation ID created in `src/proxy.ts` is returned on the response and is available to Server
Components. It is not forwarded to Trade because no storefront correlation-header contract is
published. Route values must be normalized templates (`/products/[handle]`, not a commercially
sensitive URL) before emission.

## Provider activation gate

Before instrumentation is enabled, owners must approve:

1. processor/provider, data region, retention, access control and deletion policy;
2. server and browser ingestion endpoints, sampling and release identifiers;
3. an explicit allowlist/redaction schema and automated tests proving forbidden fields are dropped;
4. CSP changes for exact endpoints only;
5. alert routing and runbooks for authentication, supplier persistence, catalogue/Trade availability
   and Core Web Vitals regressions;
6. client bundle and interaction-cost measurement.

Until then, Next.js supplies server exception logging and the UI supplies safe failure states, but
production field telemetry is unavailable. Console logging of arbitrary error objects is prohibited.
