import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const supplierStatusEnum = pgEnum("supplier_status", [
  "draft",
  "submitted",
  "under_review",
  "more_information_required",
  "sample_required",
  "qualification",
  "approved",
  "rejected",
  "active",
  "suspended",
  "offboarded",
])

export const verificationStatusEnum = pgEnum("verification_status", [
  "declared",
  "verified",
  "rejected",
])

/** Readiness for a future ERP adapter — not a Business Partner id (ADR-0006 / ADR-0012). */
export const erpProjectionStatusEnum = pgEnum("erp_projection_status", [
  "NOT_REQUESTED",
  "READY",
  "PENDING",
  "FAILED",
  "PROJECTED",
])

export const supplierOrganisations = pgTable("supplier_organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  medusaCustomerId: text("medusa_customer_id").notNull().unique(),
  legalName: text("legal_name").notNull(),
  registrationNumber: text("registration_number"),
  taxIdentifier: text("tax_identifier"),
  countryCode: text("country_code").notNull(),
  status: supplierStatusEnum("status").notNull().default("draft"),
  canonicalOrganisationId: text("canonical_organisation_id"),
  erpProjectionStatus: erpProjectionStatusEnum("erp_projection_status")
    .notNull()
    .default("NOT_REQUESTED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
})

export const supplierContacts = pgTable("supplier_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierOrganisationId: uuid("supplier_organisation_id")
    .notNull()
    .references(() => supplierOrganisations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const supplierCapabilities = pgTable("supplier_capabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierOrganisationId: uuid("supplier_organisation_id")
    .notNull()
    .references(() => supplierOrganisations.id, { onDelete: "cascade" }),
  productCategory: text("product_category").notNull(),
  variety: text("variety"),
  grade: text("grade"),
  originCountryCode: text("origin_country_code"),
  capacityDescription: text("capacity_description"),
  season: text("season"),
  leadTimeDays: integer("lead_time_days"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("declared"),
  declaredAt: timestamp("declared_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verifiedBy: text("verified_by"),
})

export const supplierCertifications = pgTable("supplier_certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierOrganisationId: uuid("supplier_organisation_id")
    .notNull()
    .references(() => supplierOrganisations.id, { onDelete: "cascade" }),
  certificationType: text("certification_type").notNull(),
  issuer: text("issuer"),
  referenceNumber: text("reference_number"),
  issuedOn: text("issued_on"),
  expiresOn: text("expires_on"),
  verificationStatus: verificationStatusEnum("verification_status").notNull().default("declared"),
  declaredAt: timestamp("declared_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verifiedBy: text("verified_by"),
})

/**
 * Metadata-only evidence pointers (ADR-0012). No blob bytes stored here.
 */
export const supplierDocumentReferences = pgTable("supplier_document_references", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierOrganisationId: uuid("supplier_organisation_id")
    .notNull()
    .references(() => supplierOrganisations.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  /** External URI or offline handling note — never estate-hosted object key until storage ADR. */
  externalReference: text("external_reference"),
  contentHash: text("content_hash"),
  recordedBy: text("recorded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const supplierStatusEvents = pgTable("supplier_status_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierOrganisationId: uuid("supplier_organisation_id")
    .notNull()
    .references(() => supplierOrganisations.id, { onDelete: "cascade" }),
  fromStatus: supplierStatusEnum("from_status"),
  toStatus: supplierStatusEnum("to_status").notNull(),
  actor: text("actor").notNull(),
  reason: text("reason"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
})
