CREATE TYPE "public"."supplier_kyb_decision" AS ENUM('pending', 'verified', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."supplier_kyb_evidence_kind" AS ENUM('company_registration', 'tax_registration', 'registered_address', 'beneficial_ownership', 'director_identity', 'operating_licence', 'other');--> statement-breakpoint
CREATE TABLE "supplier_kyb_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "supplier_organisation_id" uuid NOT NULL,
  "kind" "supplier_kyb_evidence_kind" NOT NULL,
  "reference" text NOT NULL,
  "content_hash" text,
  "issuing_country" text,
  "recorded_by" text NOT NULL,
  "recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "supplier_kyb_decisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "supplier_organisation_id" uuid NOT NULL,
  "decision" "supplier_kyb_decision" NOT NULL,
  "reason_codes" text DEFAULT '[]' NOT NULL,
  "applicant_visible_explanation" text,
  "decided_by" text NOT NULL,
  "decided_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "supplier_kyb_evidence" ADD CONSTRAINT "supplier_kyb_evidence_supplier_organisation_id_supplier_organisations_id_fk" FOREIGN KEY ("supplier_organisation_id") REFERENCES "public"."supplier_organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_kyb_decisions" ADD CONSTRAINT "supplier_kyb_decisions_supplier_organisation_id_supplier_organisations_id_fk" FOREIGN KEY ("supplier_organisation_id") REFERENCES "public"."supplier_organisations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "supplier_kyb_evidence_supplier_idx" ON "supplier_kyb_evidence" USING btree ("supplier_organisation_id");--> statement-breakpoint
CREATE INDEX "supplier_kyb_decisions_supplier_decided_idx" ON "supplier_kyb_decisions" USING btree ("supplier_organisation_id","decided_at");
