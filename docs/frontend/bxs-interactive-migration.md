# BXS interactive-family migration

ADR-SHARED-040 §2.4. The navigation disclosure now uses Base UI Popover
instead of document-level custom dismissal handlers. Links keep native
navigation semantics. Base UI Select replaces the audited simple option-based
controls while preserving field names, submitted values, labels, required and
disabled states. Existing Server Actions remain the authority for every value.

The browser-mode Storybook suite is now a mandatory CI step. The country
selection story verifies keyboard choice, FormData, Escape and returned focus;
existing real-page header tests verify disclosure dismissal and navigation.
Portalled content is queried through the document, not a detached canvas root.
Raw native inputs, textareas and semantic page content remain native.

Shared 0.2.0 tokens/UI stay pinned. New Shared APIs and geo-core installation
require an independently published and verified release; imports or declarations
alone do not qualify a consumer as fully migrated. Performance build budgets
remain lab asset guards, not field P75 or Lighthouse evidence.
