import type { Metadata } from "next"
import { LegalDraftPage } from "@/components/legal/legal-draft-page"

export const metadata: Metadata = {
  title: "Terms draft",
  description: "Draft website terms for ZuriBeans review.",
  robots: { index: false, follow: false },
}

export default function TermsPage() {
  return (
    <LegalDraftPage
      title="Website terms"
      summary="A draft outline for the conditions governing use of the public ZuriBeans estate."
    >
      <h2>Public website use</h2>
      <p>
        Final approved copy should describe permitted use of this website, intellectual property,
        acceptable conduct, availability of information and the difference between public content
        and authorized commercial terms.
      </p>
      <h2>Commercial boundaries</h2>
      <p>
        Product information, market context and availability are not a quotation or a binding offer
        unless supplied through an authorized commercial process. Any final terms must be reviewed
        against the relevant market and contracting entities.
      </p>
      <h2>Review items</h2>
      <p>
        Legal review is still required for governing law, liability, dispute handling, third-party
        links, changes to the terms and the approved notice and contact details.
      </p>
    </LegalDraftPage>
  )
}
