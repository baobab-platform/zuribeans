import Link from "next/link"
import { StructuredData } from "@/components/seo/structured-data"

export type BreadcrumbItem = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: item.href } : {}),
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.href && !isCurrent ? (
                  <Link
                    href={item.href}
                    className="inline-block py-1 hover:text-ink hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isCurrent ? "page" : undefined}
                    className={isCurrent ? "text-ink" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
