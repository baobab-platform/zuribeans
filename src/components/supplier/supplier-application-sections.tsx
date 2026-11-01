import { SupplierCertificationPicker } from "./supplier-certification-picker"
import { Alert } from "@/components/ui/alert"
import { Input, Select, FieldDescription } from "@/components/ui/form-controls"
import { SUPPLIER_CAPABILITY_CATEGORIES } from "@/lib/supplier/categories"

export type SupplierFormPrefill = {
  legalName?: string
  countryCode?: string
  registrationNumber?: string
  taxIdentifier?: string
  contactName?: string
  contactRole?: string
  contactEmail?: string
  contactPhone?: string
  capabilities?: readonly {
    category?: string
    variety?: string | null
    grade?: string | null
    originCountryCode?: string | null
    capacityDescription?: string | null
    season?: string | null
    leadTimeDays?: number | null
  }[]
  certifications?: readonly {
    certificationType?: string
    issuer?: string | null
    referenceNumber?: string | null
    issuedOn?: string | null
    expiresOn?: string | null
  }[]
}
const slots = [0, 1, 2]
const label = "block text-sm font-semibold text-ink"
const group = "space-y-5"
const heading = "font-display text-2xl text-ink"
const intro = "mt-2 mb-8 text-sm leading-7 text-muted"
const inputBox = "grid gap-5 sm:grid-cols-2"
const fields = (title: string, description: string, children: React.ReactNode) => (
  <section className={group}>
    <h2 className={heading}>{title}</h2>
    <p className={intro}>{description}</p>
    {children}
  </section>
)

/**
 * Presentation-only Make supplier application steps, generated on the server.
 * Repeated field names and fixed slots are intentionally kept in the exact
 * index order expected by buildSupplierApplicationInput / Zod and the existing
 * server action. Additional prototype-only data is never persisted silently.
 */
export function supplierApplicationSections(initial: SupplierFormPrefill = {}) {
  return [
    fields("Business Details", "Provide your registered business details for due diligence and contract review.", (
      <div className={group}>
        <label className={label}>Registered Organisation Name *<Input name="legalName" required autoComplete="organization" defaultValue={initial.legalName} placeholder="e.g. Elgon Coffee Cooperative Ltd" /></label>
        <label className={label}>Country of Registration *<Select name="countryCode" required defaultValue={initial.countryCode || ""}>
          <option value="">Select country</option>
          <option value="UG">Uganda</option>
          <option value="ZA">South Africa</option>
          <option value="TZ">Tanzania</option>
          <option value="KE">Kenya</option>
          <option value="ET">Ethiopia</option>
        </Select></label>
        <label className={label}>Company Registration Number<Input name="registrationNumber" defaultValue={initial.registrationNumber} placeholder="Company registration identifier" /></label>
        <label className={label}>Tax Identifier<Input name="taxIdentifier" defaultValue={initial.taxIdentifier} placeholder="Company tax reference" /></label>
      </div>
    )),
    fields("Primary Contact", "Who should ZuriBeans contact to discuss this application?", (
      <div className={group}>
        <label className={label}>Full Name *<Input name="contactName" required autoComplete="name" defaultValue={initial.contactName} placeholder="First and last name" /></label>
        <label className={label}>Role / Title *<Input name="contactRole" required autoComplete="organization-title" defaultValue={initial.contactRole} placeholder="e.g. Export Manager" /></label>
        <label className={label}>Email Address *<Input name="contactEmail" type="email" required autoComplete="email" defaultValue={initial.contactEmail} placeholder="name@organisation.com" /></label>
        <label className={label}>Phone Number<Input name="contactPhone" type="tel" autoComplete="tel" defaultValue={initial.contactPhone} placeholder="+256 …" /></label>
      </div>
    )),
    fields("Products & Capacity", "Declare your products, grades and estimated annual supply. The first product is required.", (
      <div className={group}>
        {slots.map((slot) => {
          const row = initial.capabilities?.[slot]
          return <div key={slot} className="rounded-control border border-line bg-surface p-5">
            <h3 className="mb-5 font-semibold">Product {slot + 1}{slot === 0 ? " (required)" : " (optional)"}</h3>
            <div className={inputBox}>
              <label className={label}>Product category
                <Select name="capability_category" required={slot === 0} defaultValue={row?.category || ""}>
                  <option value="">Select product</option>
                  {SUPPLIER_CAPABILITY_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Select>
              </label>
              <label className={label}>Variety<Input name="capability_variety" defaultValue={row?.variety ?? ""} placeholder="e.g. SL28, Bourbon" /></label>
              <label className={label}>Grade<Input name="capability_grade" defaultValue={row?.grade ?? ""} placeholder="e.g. AA Screen 18" /></label>
              <label className={label}>Estimated annual supply volume<Input name="capability_capacity" defaultValue={row?.capacityDescription ?? ""} placeholder="e.g. 500 MT per annum" /></label>
              <label className={label}>Lead time (days)<Input name="capability_lead_time_days" type="number" min={0} inputMode="numeric" defaultValue={row?.leadTimeDays ?? ""} /></label>
            </div>
          </div>
        })}
      </div>
    )),
    fields("Origin & Seasonality", "Where are your products grown or produced, and when is each product available?", (
      <div className={group}>
        {slots.map((slot) => <div key={slot} className="rounded-control border border-line bg-surface p-5">
          <h3 className="mb-5 font-semibold">Product {slot + 1} — Origin & Season</h3>
          <div className={inputBox}>
            <label className={label}>Country of product origin
              <Select name="capability_origin_country" defaultValue={initial.capabilities?.[slot]?.originCountryCode ?? ""}>
                <option value="">Not specified</option>
                <option value="UG">Uganda</option><option value="ZA">South Africa</option>
                <option value="TZ">Tanzania</option><option value="KE">Kenya</option><option value="ET">Ethiopia</option>
              </Select>
            </label>
            <label className={label}>Harvest / supply season
              <Input name="capability_season" defaultValue={initial.capabilities?.[slot]?.season ?? ""} placeholder="e.g. October–January, May–July" />
            </label>
          </div>
        </div>)}
        <FieldDescription>Detailed farm and district evidence is requested only when the responsible traceability engine supports it.</FieldDescription>
      </div>
    )),
    fields("Certifications", "Declare certificates currently held. Every declaration remains unverified until independently reviewed.", (
      <div className={group}>
        <Alert title="Document upload is not available yet" tone="info">Documentary custody remains with the authorised provider. Do not send private certificate files through this form.</Alert>
        <SupplierCertificationPicker initial={initial.certifications} />
      </div>
    )),
  ]
}
