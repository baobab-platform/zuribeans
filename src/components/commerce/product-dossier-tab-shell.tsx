"use client"

import { useState, type ReactNode } from "react"
import { classNames } from "@/lib/ui/classnames"

const tabs = [
  { id: "specifications", label: "Specifications" },
  { id: "provenance", label: "Provenance" },
  { id: "quality", label: "Quality" },
  { id: "evidence", label: "Evidence & Docs" },
] as const
type TabId = (typeof tabs)[number]["id"]

/** Keep the interactive tabs lightweight; render dossier content on the server. */
export function ProductDossierTabShell({ panels }: { panels: readonly ReactNode[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("specifications")

  return (
    <section aria-label="Product dossier" className="min-w-0" id="product-dossier">
      <div className="max-w-full overflow-x-auto border-b border-line" tabIndex={0}>
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Product dossier sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`product-panel-${tab.id}`}
              id={`product-tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
                event.preventDefault()
                const index = tabs.findIndex((entry) => entry.id === activeTab)
                const nextIndex =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
                const target = tabs[nextIndex]
                setActiveTab(target.id)
                document.getElementById(`product-tab-${target.id}`)?.focus()
              }}
              className={classNames(
                "min-h-12 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "border-ink text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          id={`product-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`product-tab-${tab.id}`}
          tabIndex={0}
          hidden={activeTab !== tab.id}
          className="py-7 focus-visible:outline-2 focus-visible:outline-ink"
        >
          {panels[index]}
        </div>
      ))}
    </section>
  )
}
