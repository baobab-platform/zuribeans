# ZuriBeans global shell

Status: Gate 4 implemented, header redesigned to a two-tier trade-desk shell
Reviewed: 2026-09-19

The global shell provides a sticky server-rendered two-tier brand header, grouped desktop
navigation with accessible disclosures, an isolated mobile navigation client island,
pathname-preserving market switcher, session-presence account link, skip link, main landmark, and
structured footer. See `docs/frontend/site-header.md` for the header's full anatomy, tokens and
breakpoints.

## Boundaries

- Session presence changes the account link label only. It is not proof of a valid identity or an
  approved trading account; protected layouts still validate the customer with Medusa.
- Market selection receives normalized `MarketContext` and writes no independent client state. The
  existing server proxy remains authoritative. The header's Markets disclosure and utility-bar
  market context are both built from that same context — neither hardcodes Uganda or South Africa.
- Client islands are narrow and specific: the mobile menu (native-dialog primitive), each primary
  navigation disclosure (`NavDisclosure`, click/keyboard, no independent data), and
  `HeaderScrollState` (a headless `IntersectionObserver` that toggles one class on `<html>`, no
  React state and no scroll listener). None contain data integration.
- Footer statements avoid invented addresses, certifications, warehouses, policies and regulatory
  claims.

## Responsive behaviour

- Below `xl` (1280px), the full two-tier header collapses to a single ~64–68px row: brand, market
  switcher is dropped from view, and one menu button opens the mobile drawer. Nothing in this
  project introduces an intermediate desktop/tablet layout beyond that switch — the existing `xl`
  boundary already keeps tablet widths in the compact, tested mobile shell.
- At and above `xl`, the utility bar's centre strapline additionally hides below `2xl` (1536px) so
  it never crowds the primary navigation at the narrower end of desktop widths.
- The mobile menu is the only interactive island the shell adds beyond the desktop disclosures. It
  uses the owned native-dialog primitive and contains no data integration.

## Sticky / scrolled state

- Initial: ~32px utility bar + ~72px primary row (~104px total).
- After ~104px of scroll, `HeaderScrollState`'s sentinel (rendered as the header's immediate
  preceding sibling in `layout.tsx`, not inside it — a sticky header's own children never leave the
  observer's root) crosses an `IntersectionObserver` threshold and toggles `is-header-scrolled` on
  `<html>`.
- The header and its children read that ancestor class through Tailwind's `[.is-header-scrolled_&]`
  arbitrary variant: the utility bar collapses to 0 height, the primary row shrinks 72px → 64px, and
  the brand mark shrinks 48px → 40px. Wordmark, strapline copy, primary navigation and the Request a
  Quote CTA are unaffected — only their containing row's height changes.
- The transition is a plain CSS `transition` on `height`/`opacity` (180–240ms), neutralized globally
  under `prefers-reduced-motion: reduce` already in `globals.css`. No animation library was added.

## Accessibility

- The home brand has an explicit accessible name and its decorative dot is hidden.
- The menu trigger identifies a dialog; the native modal handles focus containment and Escape.
- Each primary navigation disclosure is a real `<button aria-expanded aria-controls>`; its panel
  uses the `hidden` attribute when closed, so closed content is out of the tab order without a
  manual focus trap. Escape closes an open disclosure and returns focus to its trigger. Hover is not
  a required or sole path to any disclosure.
- The skip link becomes fixed and visible on focus and targets a focusable main landmark.
- Navigation landmarks have distinct labels (`Primary navigation`, `Mobile navigation`).

## Iconography

Lucide React only, tree-shaken per icon: `Globe2` (market), `Handshake` (supplier),
`CircleHelp` (help), `UserRound` (account), `ChevronDown` (disclosure), `ArrowRight` (commercial
CTA), `Menu`/`X` (mobile trigger/close). Decorative icons beside visible text are `aria-hidden`.

## Performance

The shell adds no external animation/icon library, external font, third-party script or upstream
request beyond what already existed. `HeaderScrollState` is the only new script and costs one
`IntersectionObserver` callback per threshold crossing, never a per-pixel scroll handler or React
re-render. `NavDisclosure` islands mount only their own button/panel state. Gate 15's build budgets
remain enforced and green after this change (see `docs/frontend/performance.md`).
