import { CorporateHero } from "@/components/marketing/corporate-hero"
import { ButtonLink } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getPublicPageMetadata } from "@/lib/seo/metadata"
import { hasCustomerSession } from "@/lib/auth/session-storage"

export const metadata = getPublicPageMetadata({
  title: "Help",
  description: "Find the right ZuriBeans channel for a sourcing, supplier or account question.",
  path: "/help",
})

const helpTopics = [
  {
    eyebrow: "Buyers",
    title: "Discuss a sourcing requirement.",
    description:
      "Tell the trade desk your product, specification, volume, destination and timing so it can respond with a defined next step.",
    action: { href: "/contact", label: "Contact the trade desk" },
  },
  {
    eyebrow: "Suppliers",
    title: "Apply or check application status.",
    description:
      "Start a new supplier application or review the status and declared capability of an existing one.",
    action: { href: "/sourcing/become-a-supplier", label: "Review supplier requirements" },
  },
  {
    eyebrow: "Account",
    title: "Sign in to an existing account.",
    description: "Return to your buyer account, or create a login if you do not have one yet.",
    action: { href: "/login", label: "Go to sign in" },
  },
  {
    eyebrow: "Trade",
    title: "Understand how ZuriBeans trades.",
    description:
      "Read about transaction classes, documentation, logistics coordination and quality and traceability standards.",
    action: { href: "/trade", label: "How we trade" },
  },
] as const

export default async function HelpPage() {
  const hasSession = await hasCustomerSession()

  return (
    <>
      <CorporateHero
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Help" }]}
        eyebrow="Support"
        title="Find the right place to start."
        description="Help routes a sourcing, supplier or account question to the part of ZuriBeans that can actually answer it."
      />
      <section className="page-container grid gap-6 pb-20 md:grid-cols-2 lg:pb-24">
        {helpTopics.map((topic) => (
          <Card key={topic.title} className="p-8">
            <p className="eyebrow">{topic.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl">{topic.title}</h2>
            <p className="mt-4 text-sm leading-6 text-muted">{topic.description}</p>
            <ButtonLink href={topic.action.href} className="mt-7">
              {topic.action.label}
            </ButtonLink>
          </Card>
        ))}
        <Card className="p-8 md:col-span-2">
          <p className="eyebrow">Already trading with ZuriBeans</p>
          <h2 className="mt-4 font-display text-3xl">
            {hasSession ? "Continue in your account." : "Sign in to continue."}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">
            {hasSession
              ? "Open your account for current orders, applications and organisation details."
              : "An account keeps your buyer or supplier activity in one place once you sign in."}
          </p>
          <ButtonLink href={hasSession ? "/account" : "/login"} variant="outline" className="mt-7">
            {hasSession ? "Open account" : "Sign in"}
          </ButtonLink>
        </Card>
      </section>
    </>
  )
}
