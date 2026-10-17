"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Popover } from "@base-ui/react/popover"

export type NavDisclosureItem = { href: string; label: string }

/**
 * Base UI owns outside-click, Escape, positioning and focus restoration.
 * Links remain native navigation; opening this disclosure never changes
 * buyer/supplier authorisation or the effective market context.
 */
export function NavDisclosure({
  label,
  items,
}: {
  label: string
  items: readonly NavDisclosureItem[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        type="button"
        className="flex items-center gap-1.5 whitespace-nowrap rounded-control px-3 py-2 text-white/85 transition-colors hover:bg-white/5 hover:text-clay-inverse"
      >
        {label}
        <ChevronDown aria-hidden="true" strokeWidth={2} className="size-3.5" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-[60]">
          <Popover.Popup
            aria-label={`${label} navigation`}
            className="w-72 max-w-[calc(100vw-2rem)] rounded-control border border-line bg-surface p-2 text-ink shadow-panel"
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
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
