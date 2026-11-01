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

/** Keep only the interaction shell in the browser; dossier content is server-rendered. */
export function ProductDossierTabShell({ panels }: { panels: readonly ReactNode[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("specifications")
  return (
    <section aria-label="Product dossier" className="min-w-0" id="product-dossier">
      <div className="max-w-full overflow-x-auto border-b border-line" tabIndex={0}>
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Product dossier sections">
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
