"use client"

import { useEffect, useRef } from "react"

/**
 * Toggles `is-header-scrolled` on the document root via a direct DOM write,
 * not React state — so scrolling never triggers a re-render, only the CSS
 * transition on the header's own `[.is-header-scrolled_&]` variants.
 *
 * The sentinel spans document y=[0, 104px] (the header's own initial total
 * height) and is observed against the default viewport root with no
 * `rootMargin`: fully visible at scroll top (`isIntersecting: true` →
 * expanded), and once the user has scrolled past its bottom edge it leaves
 * the viewport entirely (`isIntersecting: false` → collapsed). It is
 * `position: absolute`, not part of layout flow, so it adds no visible gap;
 * it must still render as `SiteHeader`'s preceding sibling in `body`, not
 * inside it — the header is `sticky top-0` with a ~0 natural offset, so an
 * element inside it stays pinned to the viewport top from the first pixel
 * of scroll and would never leave the observer's root.
 */
export function HeaderScrollState() {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const root = document.documentElement
    const observer = new IntersectionObserver(([entry]) => {
      root.classList.toggle("is-header-scrolled", !entry.isIntersecting)
    })

    observer.observe(sentinel)
    return () => {
      observer.disconnect()
      root.classList.remove("is-header-scrolled")
    }
  }, [])

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 h-[calc(var(--header-utility-height)+var(--header-main-height))] w-px"
    />
  )
}
