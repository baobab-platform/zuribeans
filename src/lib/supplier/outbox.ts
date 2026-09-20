import "server-only"
import { randomUUID } from "node:crypto"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import type { PgTransaction } from "drizzle-orm/pg-core"
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js"
import { getDb } from "@/lib/db/client"
import * as schema from "@/lib/db/schema"
import { supplierEventOutbox } from "@/lib/db/schema"

type Tx = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

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

export const enqueueSupplierOutboxEvent = async (
  input: {
    eventType: string
    subject: string
    data: Record<string, unknown>
  },
  tx?: Tx,
) => {
  const db = tx ?? getDb()
  const envelope = {
    specversion: "1.0",
    id: randomUUID(),
    type: input.eventType,
    source: "https://baobab-platform.com/estates/zuribeans",
    subject: input.subject,
    time: new Date().toISOString(),
    datacontenttype: "application/json",
    dataschema: `https://contracts.baobab-platform.com/supplier-onboarding/v1/${input.eventType.split(".").slice(-2).join(".")}`,
    baobabscope: "tenant",
    correlationid: randomUUID(),
    tenantid: "ZURIBEANS",
    data: input.data,
  }

  const [row] = await db
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
