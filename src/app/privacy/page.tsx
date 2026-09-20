import type { Metadata } from "next"
import { LegalDraftPage } from "@/components/legal/legal-draft-page"

export const metadata: Metadata = {
  title: "Privacy draft",
  description: "Draft privacy notice for ZuriBeans review.",
  robots: { index: false, follow: false },
}

export default function PrivacyPage() {
  return (
    <LegalDraftPage
      title="Privacy notice"
      summary="A draft outline for how ZuriBeans may describe personal information, account access and service interactions."
    >
      <h2>Purpose and scope</h2>
      <p>
        This draft should explain which ZuriBeans services and interactions it covers, who the
        responsible entity is, and how the notice is kept current.
      </p>
      <h2>Information and use</h2>
      <p>
        Final approved copy should identify the categories of information collected, the purposes
        for using it, the lawful or permitted basis for processing, and the service providers or
        Baobab systems involved where relevant.
      </p>
      <h2>Rights, retention and contact</h2>
      <p>
        Final copy must be reviewed and completed with applicable rights, retention periods,
        security safeguards, international-transfer language and an approved privacy contact route.
      </p>
    </LegalDraftPage>
  )
}
