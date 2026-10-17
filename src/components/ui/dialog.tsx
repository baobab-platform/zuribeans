"use client"

import type { ReactNode } from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { buttonClassName } from "./button"

/**
 * Controlled Base UI dialog. Focus trap, Escape and focus restoration are
 * provided by Base UI. Closing never executes a privileged workflow action.
 */
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
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-ink/60" />
        <BaseDialog.Popup className="fixed left-1/2 top-1/2 z-[51] w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-panel bg-surface p-0 text-ink shadow-overlay outline-none">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <BaseDialog.Title className="font-display text-2xl">{title}</BaseDialog.Title>
                {description ? (
                  <BaseDialog.Description className="mt-2 text-sm leading-6 text-muted">
                    {description}
                  </BaseDialog.Description>
                ) : null}
              </div>
              <BaseDialog.Close
                className={buttonClassName({ variant: "ghost", size: "sm" })}
                aria-label={"Close " + title}
              >
                <X aria-hidden="true" strokeWidth={1.75} className="size-5" />
                Close
              </BaseDialog.Close>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
