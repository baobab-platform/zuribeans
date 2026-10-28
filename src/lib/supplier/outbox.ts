import "server-only"
import { randomUUID } from "node:crypto"
import type { getDb } from "@/lib/db/client"
import { supplierEventOutbox } from "@/lib/db/schema"

/**
 * Shared supplier-onboarding event names (contracts/supplier-onboarding/v1).
 * Rows stay PENDING — no broker exists (ADR-0006).
 */
export const SUPPLIER_EVENT_TYPES = {
  applicationSubmitted: "com.baobab-platform.supplier-onboarding.application.submitted.v1",
  applicationDecided: "com.baobab-platform.supplier-onboarding.application.decided.v1",
  qualificationUpdated: "com.baobab-platform.supplier-onboarding.qualification.updated.v1",
  capabilityVerified: "com.baobab-platform.supplier-onboarding.capability.verified.v1",
} as const

export const estateApplicationId = (organisationUuid: string): string =>
  `sup_${organisationUuid.replace(/-/g, "").slice(0, 24)}`

/** The caller supplies the transaction that changes the supplier record.
 * A failed insert must roll back both the mutation and its durable handoff.
 */
export const enqueueSupplierOutboxEvent = async (
  input: {
    eventType: string
    subject: string
    data: Record<string, unknown>
  },
  transaction: Pick<ReturnType<typeof getDb>, "insert">,
) => {
  const envelope = {
    specversion: "1.0",
    id: randomUUID(),
    type: input.eventType,
    source: "https://baobab-platform.com/estates/zuribeans",
    subject: input.subject,
    time: new Date().toISOString(),
    datacontenttype: "application/json",
    dataschema: "https://contracts.baobab-platform.com/supplier-onboarding/v1",
    baobabscope: "tenant" as const,
    correlationid: randomUUID(),
    tenantid: "ZURIBEANS",
    data: input.data,
  }

  const [row] = await transaction
    .insert(supplierEventOutbox)
    .values({
      eventType: input.eventType,
      subject: input.subject,
      payload: JSON.stringify(envelope),
      status: "PENDING",
    })
    .returning()

  return row
}
