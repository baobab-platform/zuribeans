"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "./button"

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={onClose}
      className="w-[min(36rem,calc(100%-2rem))] rounded-panel bg-surface p-0 text-ink shadow-overlay backdrop:bg-ink/60"
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id={titleId} className="font-display text-2xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={`Close ${title}`}>
            <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
            Close
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </dialog>
  )
}
