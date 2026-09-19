import type { Metadata } from "next"
import { LegalDraftPage } from "@/components/legal/legal-draft-page"

export const metadata: Metadata = {
  title: "Cookies draft",
  description: "Draft cookie notice for ZuriBeans review.",
  robots: { index: false, follow: false },
}

export default function CookiesPage() {
  return (
    <LegalDraftPage
      title="Cookie notice"
      summary="A draft outline for explaining cookies and similar technologies used by the ZuriBeans estate."
    >
      <h2>What this notice covers</h2>
      <p>
        Final approved copy should list the cookies and similar technologies actually used by the
        estate, their purposes, providers, durations and whether they are essential or optional.
      </p>
      <h2>Controls and consent</h2>
      <p>
        The final notice must match the implemented consent and preference controls. No optional
        analytics, advertising or third-party technology should be described here until it is
        approved and deployed.
      </p>
      <h2>Changes and contact</h2>
      <p>
        Final copy should explain how this notice changes and provide the approved route for
        questions about cookies and privacy.
      </p>
    </LegalDraftPage>
  )
}
