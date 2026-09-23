"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

export type NavDisclosureItem = { href: string; label: string }

/**
 * Click/keyboard disclosure, not a hover mega-menu: a real `<button>` gives
 * Enter/Space for free, `hidden` removes the closed panel from the tab order
 * (no focus trap to manage), and Escape returns focus to the trigger.
 */
export function NavDisclosure({
  label,
  items,
}: {
  label: string
  items: readonly NavDisclosureItem[]
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-control px-3 py-2 text-white/85 transition-colors hover:bg-white/5 hover:text-clay-inverse"
      >
        {label}
        <ChevronDown aria-hidden="true" strokeWidth={2} className="size-3.5" />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-0 z-10 mt-2 w-72 rounded-control border border-line bg-surface p-2 text-ink shadow-panel"
      >
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-control px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-muted hover:text-clay-on-light"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
