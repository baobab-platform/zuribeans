"use client"

import { useEffect, useRef } from "react"

/**
 * Toggles `is-header-scrolled` on the document root via a direct DOM write,
 * not React state — so scrolling never triggers a re-render, only the CSS
 * transition on the header's own `[.is-header-scrolled_&]` variants. A
 * one-pixel sentinel plus `IntersectionObserver` (with a negative top
 * `rootMargin` standing in for the ~104px collapse threshold) replaces a
 * scroll listener entirely, so this island costs nothing between crossings
 * of that threshold.
 *
 * Must render as `SiteHeader`'s immediate preceding sibling in `body`, not
 * inside it: the header is `sticky top-0` with a ~0 natural offset, so
 * anything rendered inside it stays pinned to the viewport top from the
 * first pixel of scroll and would never leave the observer's root. Placed
 * before the header instead, the sentinel scrolls away normally while the
 * header stays fixed, which is what lets the intersection change at all.
 */
export function HeaderScrollState() {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const root = document.documentElement
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.classList.toggle("is-header-scrolled", !entry.isIntersecting)
      },
      { rootMargin: "-104px 0px 0px 0px", threshold: 0 },
    )

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      root.classList.remove("is-header-scrolled")
    }
  }, [])

  return <div ref={sentinelRef} aria-hidden="true" className="h-px" />
}
