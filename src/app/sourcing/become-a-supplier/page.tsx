import { SupplierPortalEntry } from "@/components/supplier/supplier-portal-entry"
import { Card } from "@/components/ui/card"
import { getPublicPageMetadata } from "@/lib/seo/metadata"

export const metadata = getPublicPageMetadata({
  title: "Become a supplier",
  description:
    "Apply to join the ZuriBeans sourcing network with structured business, product, origin and capacity information.",
  path: "/sourcing/become-a-supplier",
})

export default function BecomeASupplierPage() {
  return (
    <>
      <SupplierPortalEntry
        eyebrow="Supplier programme"
        title="Become a ZuriBeans supplier."
        description="Join the ZuriBeans supplier network. Present your business identity, contacts, products, origin, annual capacity and certifications for structured sourcing review."
        primaryHref="/supplier/register"
        primaryLabel="Create supplier login"
        secondaryHref="/supplier/login"
        secondaryLabel="Existing supplier? Sign in"
      />
      <section className="page-container py-14">
        <p className="eyebrow">Application requirements</p>
        <h2 className="mt-4 font-display text-3xl">Prepare your supply information.</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          The application follows the Make prototype’s six sections. Login, submission, resubmission
          and status access remain governed by the existing ZuriBeans supplier service.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            ["Business identity", "Legal and registration details for the applying organisation."],
            [
              "Supply capability",
              "Product class, variety, grade, origin, season and indicative capacity.",
            ],
            [
              "Qualification evidence",
              "Certification declarations and supporting information where applicable.",
            ],
          ].map(([title, description]) => (
            <Card key={title}>
              <h2 className="font-display text-xl">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-8 bg-sand/40">
          <h2 className="font-display text-2xl">Before you apply</h2>
          <p className="mt-3 max-w-4xl leading-7 text-muted">
            Submission starts a sourcing review; it does not approve or activate a supplier.
            Declared capabilities and certifications remain unverified until ZuriBeans completes the
            relevant qualification work.
          </p>
        </Card>
      </section>
    </>
  )
}
