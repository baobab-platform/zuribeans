CREATE TYPE "public"."erp_projection_status" AS ENUM('NOT_REQUESTED', 'READY', 'PENDING', 'FAILED', 'PROJECTED');--> statement-breakpoint
ALTER TABLE "supplier_organisations" ADD COLUMN "erp_projection_status" "erp_projection_status" DEFAULT 'NOT_REQUESTED' NOT NULL;--> statement-breakpoint
CREATE TABLE "supplier_document_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_organisation_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"external_reference" text,
	"content_hash" text,
	"recorded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "supplier_document_references" ADD CONSTRAINT "supplier_document_references_supplier_organisation_id_supplier_organisations_id_fk" FOREIGN KEY ("supplier_organisation_id") REFERENCES "public"."supplier_organisations"("id") ON DELETE cascade ON UPDATE no action;
