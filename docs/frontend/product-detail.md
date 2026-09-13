# Product detail

Status: Gate 7 implemented  
Reviewed: 2026-09-13

The product detail route is a market-aware Server Component designed for professional evaluation.
It presents only fields supplied by the Medusa product projection and deliberately withholds
buyer-specific commercial information.

## Presentation contract

The Medusa adapter normalizes:

- title, description, origin and product categories;
- a strict allowlist of public metadata fields for grade, processing, packaging, minimum order,
  published availability notes, market availability, Incoterm context and traceability;
- quality information and certifications;
- published formats and SKUs;
- product media through the configured origin allowlist.

Unknown metadata, including any field resembling a confidential price, is not passed into the page
model. Missing data is described honestly rather than inferred.

## States and performance

- Missing products render the route-level not-found state.
- Trade-service failures render a fail-closed service state and noindex metadata.
- Page data is request-memoized across metadata generation and page rendering.
- A genuine product hero is priority-loaded; all external media remains subject to the Gate 6
  optimization allowlist.

Request-product-information links currently terminate at the documented contact boundary. Cart,
quote and authorization-specific actions remain gated on their real Baobab Trade contracts.
