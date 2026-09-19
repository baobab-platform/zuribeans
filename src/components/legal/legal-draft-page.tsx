import type { ReactNode } from "react"

export function LegalDraftPage({
  title,
  summary,
  children,
}: {
  title: string
  summary: string
  children: ReactNode
}) {
  return (
    <article className="page-container max-w-4xl py-16 lg:py-24">
      <div className="rounded-panel border border-warning bg-warning-soft p-5 text-warning-strong">
        <p className="text-xs font-bold uppercase tracking-[0.16em]">Draft for review</p>
        <p className="mt-2 text-sm leading-6">
          This page is a non-final draft for internal review. It is not legal advice and does not
          yet constitute an approved policy, contract or notice.
        </p>
      </div>
      <header className="mt-10 max-w-3xl">
        <p className="eyebrow">ZuriBeans legal</p>
        <h1 className="mt-4 font-display text-5xl text-balance">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted">{summary}</p>
      </header>
      <div className="prose prose-lg mt-12 max-w-3xl text-muted">{children}</div>
    </article>
  )
}
