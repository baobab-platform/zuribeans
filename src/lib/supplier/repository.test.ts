import { sql } from "drizzle-orm"
import { afterAll, beforeEach, describe, expect, it } from "vitest"
import { getDb } from "@/lib/db/client"
import { supplierOrganisations } from "@/lib/db/schema"
import {
  getSupplierApplicationForCustomer,
  setSupplierCanonicalOrganisationId,
  submitSupplierApplication,
} from "./repository"

/**
 * Integration test against a real Postgres database — schema/migration
 * mistakes (a wrong column type, a missing default, a broken transaction)
 * don't show up against mocks. Skipped when SUPPLIER_DB_URL isn't set
 * (e.g. a contributor without a local Postgres); CI provides one via a
 * service container and runs `drizzle-kit migrate` first (see ci.yml).
 */
const hasDatabase = Boolean(process.env.SUPPLIER_DB_URL)

const truncateAll = () =>
  getDb().execute(sql`
    truncate table
      supplier_status_events,
      supplier_certifications,
      supplier_capabilities,
      supplier_contacts,
      supplier_organisations
    cascade
  `)

const validInput = {
  legalName: "Okafor Roasters Ltd",
  registrationNumber: "UG-12345",
  taxIdentifier: undefined,
  countryCode: "UG",
  contactName: "Amara Okafor",
  contactEmail: "amara@okafor-roasters.example",
  contactRole: "Sales",
  contactPhone: undefined,
  capabilities: [
    {
      category: "coffee",
      variety: "Arabica",
      grade: "AA",
      originCountryCode: "UG",
      capacityDescription: "50 tonnes/year",
      season: "October-February",
      leadTimeDays: 30,
    },
  ],
  certifications: [{ certificationType: "Organic", issuer: "EU", referenceNumber: "ORG-1" }],
}

describe.runIf(hasDatabase)("supplier repository", () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await truncateAll()
  })

  it("submits an application and reads it back", async () => {
    const created = await submitSupplierApplication("cus_test_123", validInput)
    expect(created.status).toBe("submitted")
    expect(created.submittedAt).not.toBeNull()

    const fetched = await getSupplierApplicationForCustomer("cus_test_123")
    expect(fetched).not.toBeNull()
    expect(fetched?.organisation.legalName).toBe("Okafor Roasters Ltd")
    expect(fetched?.capabilities).toHaveLength(1)
    expect(fetched?.capabilities[0].productCategory).toBe("coffee")
    expect(fetched?.certifications).toHaveLength(1)

    const rows = await getDb().select().from(supplierOrganisations)
    expect(rows).toHaveLength(1)
  })

  it("returns null for a customer with no application", async () => {
    const fetched = await getSupplierApplicationForCustomer("cus_no_application")
    expect(fetched).toBeNull()
  })

  it("rejects a second application for the same customer (one per customer)", async () => {
    await submitSupplierApplication("cus_test_dup", validInput)
    await expect(submitSupplierApplication("cus_test_dup", validInput)).rejects.toThrow()
  })

  it("sets canonical_organisation_id on an existing supplier organisation", async () => {
    const created = await submitSupplierApplication("cus_test_canonical", validInput)
    expect(created.canonicalOrganisationId).toBeNull()

    const updated = await setSupplierCanonicalOrganisationId(created.id, "canon-org-123")
    expect(updated?.canonicalOrganisationId).toBe("canon-org-123")

    const fetched = await getSupplierApplicationForCustomer("cus_test_canonical")
    expect(fetched?.organisation.canonicalOrganisationId).toBe("canon-org-123")
  })

  it("returns null for an unknown supplier organisation id", async () => {
    const updated = await setSupplierCanonicalOrganisationId(
      "00000000-0000-0000-0000-000000000000",
      "canon-org-123",
    )
    expect(updated).toBeNull()
  })
})
