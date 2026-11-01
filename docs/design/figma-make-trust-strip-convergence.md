# Figma Make component migration — 02: Homepage trust strip

Status: **Proposed — PR review and CI required**  
Source: [ZuriBeans Figma Make prototype](https://www.figma.com/make/hFXETuzHwQ9cUawGUuPcoj/ZuriBeans-Prototype), `src/components/TrustStrip.tsx`.

## Scope and design translation

The immediate post-hero ribbon is the only homepage component changed by this PR. It retains the
approved hero, server-side homepage composition, market context, supplier workflows and all
downstream homepage components unchanged.

- Compact forest-green band, gold uppercase 12px labels, 11px secondary text, 3px spacing,
  18px vertical / 28px horizontal item padding, 140px minimum item width and fine dividers.
- Scrolls horizontally on narrow viewports without clipping or reducing touch/readability.
- Uses a keyboard-focusable, semantically named region containing a list of evidence items.
- Maintains AA-conscious secondary text contrast rather than copying the prototype's low-opacity
  `rgba(247,242,233,0.42)`.
- Existing longer authoritative descriptions remain readable instead of being clipped to fit
  the prototype's short placeholders.

## Authority boundary

The Make design's sample labels such as **ISO 22000**, **EUDR Ready**, **UTZ/RA**, and
**C.O.D Capable** are visual prototype content, **not verified ZuriBeans credentials**.
They are not published. `HomePage` continues to pass `getVisibleEvidence(TRUST_EVIDENCE)`;
the component renders only that provided evidence and returns nothing for an empty list.
It does not infer certificates, financing facilities, shipping readiness or approval.

## Review / acceptance

Run format, lint, typecheck, tests, build, the original 64 KiB total CSS budget and
responsive screenshot checks at 320 / 390 / 768 / 1024 / 1440 widths. Existing full-page
screenshots must be **independently reviewed** before refreshing; do not auto-accept pixel
differences. No hero regression is permitted.

Next migration after approval: **Featured Commodities**, in a separate PR.
