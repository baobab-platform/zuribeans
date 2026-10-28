import { eq, sql } from "drizzle-orm"
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest"
import { getDb } from "@/lib/db/client"
import {
  supplierCapabilities,
  supplierEventOutbox,
  supplierOrganisations,
  supplierStatusEvents,
} from "@/lib/db/schema"
import {
  getSupplierApplicationById,
  getSupplierApplicationForCustomer,
  listSupplierApplications,
  resubmitSupplierApplication,
  setCapabilityVerification,
  setSupplierCanonicalOrganisationId,
  submitSupplierApplication,
  transitionSupplierStatus,
} from "./repository"

const hasDatabase = Boolean(process.env.SUPPLIER_DB_URL)

const truncateAll = () =>
  getDb().execute(sql`
    truncate table
      supplier_status_events,
      supplier_certifications,
      supplier_capabilities,
      supplier_contacts,
      supplier_event_outbox,
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

  afterEach(async () => {
    await getDb().execute(
      sql`DROP TRIGGER IF EXISTS test_refuse_supplier_outbox ON supplier_event_outbox`,
    )
    await getDb().execute(sql`DROP FUNCTION IF EXISTS test_refuse_supplier_outbox()`)
  })

  const refuseOutbox = async () => {
    await getDb().execute(sql`CREATE FUNCTION test_refuse_supplier_outbox() RETURNS trigger
      LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test outbox insert refused'; END $$`)
    await getDb().execute(sql`CREATE TRIGGER test_refuse_supplier_outbox BEFORE INSERT
      ON supplier_event_outbox FOR EACH ROW EXECUTE FUNCTION test_refuse_supplier_outbox()`)
  }

  it("rolls back the whole application when its durable handoff cannot be inserted", async () => {
    await refuseOutbox()
    await expect(submitSupplierApplication("cus_outbox_failure", validInput)).rejects.toThrow()
    expect(await getSupplierApplicationForCustomer("cus_outbox_failure")).toBeNull()
    expect(await getDb().select().from(supplierStatusEvents)).toHaveLength(0)
    expect(await getDb().select().from(supplierEventOutbox)).toHaveLength(0)
  })

  it("rolls back a staff decision and its history when the outbox fails", async () => {
    const created = await submitSupplierApplication("cus_decision_failure", validInput)
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "under_review",
      actor: "staff:alice",
    })
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "qualification",
      actor: "staff:alice",
    })
    const before = await getSupplierApplicationById(created.id)
    const events = await getDb().select().from(supplierEventOutbox)
    await refuseOutbox()
    await expect(
      transitionSupplierStatus({
        supplierOrganisationId: created.id,
        toStatus: "approved",
        actor: "staff:bob",
      }),
    ).rejects.toThrow()
    const after = await getSupplierApplicationById(created.id)
    expect(after?.organisation.status).toBe("qualification")
    expect(after?.statusEvents).toEqual(before?.statusEvents)
    expect(await getDb().select().from(supplierEventOutbox)).toEqual(events)
  })

  it("rolls back applicant edits, replacement children and history when the outbox fails", async () => {
    const created = await submitSupplierApplication("cus_resubmit_failure", validInput)
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "under_review",
      actor: "staff:alice",
    })
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "more_information_required",
      actor: "staff:alice",
    })
    const before = await getSupplierApplicationById(created.id)
    const events = await getDb().select().from(supplierEventOutbox)
    await refuseOutbox()
    await expect(
      resubmitSupplierApplication("cus_resubmit_failure", {
        ...validInput,
        legalName: "Changed",
        capabilities: [],
        certifications: [],
      }),
    ).rejects.toThrow()
    expect(await getSupplierApplicationById(created.id)).toEqual(before)
    expect(await getDb().select().from(supplierEventOutbox)).toEqual(events)
  })

  it("rolls back capability verification if its event insert fails", async () => {
    const created = await submitSupplierApplication("cus_capability_failure", validInput)
    const detail = await getSupplierApplicationById(created.id)
    const capability = detail!.capabilities[0]
    await refuseOutbox()
    await expect(
      setCapabilityVerification({
        supplierOrganisationId: created.id,
        capabilityId: capability.id,
        status: "verified",
        verifiedBy: "staff:alice",
      }),
    ).rejects.toThrow()
    const [after] = await getDb()
      .select()
      .from(supplierCapabilities)
      .where(eq(supplierCapabilities.id, capability.id))
    expect(after).toEqual(capability)
    expect(await getDb().select().from(supplierEventOutbox)).toHaveLength(1)
  })

  it("serializes competing terminal decisions with exactly one matching durable event", async () => {
    const created = await submitSupplierApplication("cus_competing_decisions", validInput)
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "under_review",
      actor: "staff:alice",
    })
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "qualification",
      actor: "staff:alice",
    })
    const results = await Promise.allSettled([
      transitionSupplierStatus({
        supplierOrganisationId: created.id,
        toStatus: "approved",
        actor: "staff:bob",
      }),
      transitionSupplierStatus({
        supplierOrganisationId: created.id,
        toStatus: "rejected",
        actor: "staff:carol",
      }),
    ])
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1)
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1)
    const detail = await getSupplierApplicationById(created.id)
    const events = await getDb().select().from(supplierEventOutbox)
    const decisions = events
      .map((event) => JSON.parse(event.payload))
      .filter((event) => event.type.endsWith("application.decided.v1"))
    expect(decisions).toHaveLength(1)
    expect(decisions[0].data.decision).toBe(detail?.organisation.status)
    expect(detail?.statusEvents).toHaveLength(4)
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

  it("does not allow staff to skip from submitted to approved", async () => {
    const created = await submitSupplierApplication("cus_test_skip", validInput)
    await expect(
      transitionSupplierStatus({
        supplierOrganisationId: created.id,
        toStatus: "approved",
        actor: "staff:reviewer",
      }),
    ).rejects.toThrow(/cannot transition/i)
  })

  it("walks the staff review path to qualification and records events", async () => {
    const created = await submitSupplierApplication("cus_test_review", validInput)

    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "under_review",
      actor: "staff:alice",
      reason: "Initial triage",
    })
    await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "qualification",
      actor: "staff:alice",
    })
    const approved = await transitionSupplierStatus({
      supplierOrganisationId: created.id,
      toStatus: "approved",
      actor: "staff:bob",
      reason: "Met sourcing criteria",
    })

    expect(approved?.status).toBe("approved")

    const detail = await getSupplierApplicationById(created.id)
    expect(detail?.statusEvents.map((e) => e.toStatus)).toEqual(
      expect.arrayContaining(["submitted", "under_review", "qualification", "approved"]),
    )

    const events = await getDb().select().from(supplierStatusEvents)
    expect(events.length).toBeGreaterThanOrEqual(4)
  })

  it("verifies a capability without granting organisation approval", async () => {
    const created = await submitSupplierApplication("cus_test_cap", validInput)
    const detail = await getSupplierApplicationById(created.id)
    const capabilityId = detail!.capabilities[0].id

    const verified = await setCapabilityVerification({
      supplierOrganisationId: created.id,
      capabilityId,
      status: "verified",
      verifiedBy: "staff:alice",
    })
    expect(verified?.verificationStatus).toBe("verified")

    const after = await getSupplierApplicationById(created.id)
    expect(after?.organisation.status).toBe("submitted")
    expect(after?.capabilities[0].verificationStatus).toBe("verified")
  })

  it("lists applications filtered by status", async () => {
    await submitSupplierApplication("cus_list_a", validInput)
    const second = await submitSupplierApplication("cus_list_b", {
      ...validInput,
      legalName: "Other Co",
    })
    await transitionSupplierStatus({
      supplierOrganisationId: second.id,
      toStatus: "under_review",
      actor: "staff:alice",
    })

    const submitted = await listSupplierApplications({ status: "submitted" })
    expect(submitted.every((r) => r.status === "submitted")).toBe(true)
    expect(submitted.some((r) => r.medusaCustomerId === "cus_list_a")).toBe(true)
  })
})
